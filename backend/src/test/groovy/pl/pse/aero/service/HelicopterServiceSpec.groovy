package pl.pse.aero.service

import pl.pse.aero.domain.Helicopter
import pl.pse.aero.domain.HelicopterStatus
import pl.pse.aero.dto.HelicopterRequest
import pl.pse.aero.repository.HelicopterRepository
import spock.lang.Specification

import java.time.LocalDate

class HelicopterServiceSpec extends Specification {

    HelicopterRepository repository = Mock()
    HelicopterService service = new HelicopterService(repository)

    def "findAll should return helicopters sorted by status then registrationNumber"() {
        given:
        def h1 = Helicopter.builder().registrationNumber("SP-ZZZ").status(HelicopterStatus.INACTIVE).build()
        def h2 = Helicopter.builder().registrationNumber("SP-AAA").status(HelicopterStatus.ACTIVE).build()
        def h3 = Helicopter.builder().registrationNumber("SP-BBB").status(HelicopterStatus.ACTIVE).build()
        repository.findAll() >> [h1, h2, h3]

        when:
        def result = service.findAll()

        then:
        result*.registrationNumber == ["SP-AAA", "SP-BBB", "SP-ZZZ"]
    }

    def "findById should return helicopter when found"() {
        given:
        def heli = Helicopter.builder().id("h1").registrationNumber("SP-ABC").build()
        repository.findById("h1") >> Optional.of(heli)

        when:
        def result = service.findById("h1")

        then:
        result.registrationNumber == "SP-ABC"
    }

    def "findById should throw when not found"() {
        given:
        repository.findById("missing") >> Optional.empty()

        when:
        service.findById("missing")

        then:
        thrown(NoSuchElementException)
    }

    def "create should save helicopter with valid data"() {
        given:
        def request = HelicopterRequest.builder()
                .registrationNumber("SP-NEW")
                .type("EC135")
                .maxCrewCount(4)
                .maxCrewWeightKg(400)
                .status(HelicopterStatus.ACTIVE)
                .inspectionExpiryDate(LocalDate.of(2026, 12, 31))
                .rangeKm(600)
                .build()
        repository.save(_) >> { Helicopter h -> h }

        when:
        def result = service.create(request)

        then:
        result.registrationNumber == "SP-NEW"
        result.type == "EC135"
        result.status == HelicopterStatus.ACTIVE
    }

    def "create should reject ACTIVE helicopter without inspection date"() {
        given:
        def request = HelicopterRequest.builder()
                .registrationNumber("SP-BAD")
                .type("Bell 407")
                .maxCrewCount(2)
                .maxCrewWeightKg(200)
                .status(HelicopterStatus.ACTIVE)
                .inspectionExpiryDate(null)
                .rangeKm(300)
                .build()

        when:
        service.create(request)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("inspection expiry date")
    }

    def "create should allow INACTIVE helicopter without inspection date"() {
        given:
        def request = HelicopterRequest.builder()
                .registrationNumber("SP-OFF")
                .type("EC145")
                .maxCrewCount(3)
                .maxCrewWeightKg(300)
                .status(HelicopterStatus.INACTIVE)
                .inspectionExpiryDate(null)
                .rangeKm(400)
                .build()
        repository.save(_) >> { Helicopter h -> h }

        when:
        def result = service.create(request)

        then:
        result.status == HelicopterStatus.INACTIVE
        result.inspectionExpiryDate == null
    }

    def "update should modify existing helicopter"() {
        given:
        def existing = Helicopter.builder().id("h1").registrationNumber("SP-OLD").status(HelicopterStatus.INACTIVE).build()
        repository.findById("h1") >> Optional.of(existing)
        repository.save(_) >> { Helicopter h -> h }

        def request = HelicopterRequest.builder()
                .registrationNumber("SP-UPD")
                .type("EC135")
                .maxCrewCount(4)
                .maxCrewWeightKg(400)
                .status(HelicopterStatus.ACTIVE)
                .inspectionExpiryDate(LocalDate.of(2026, 6, 1))
                .rangeKm(500)
                .build()

        when:
        def result = service.update("h1", request)

        then:
        result.id == "h1"
        result.registrationNumber == "SP-UPD"
        result.status == HelicopterStatus.ACTIVE
    }
}
