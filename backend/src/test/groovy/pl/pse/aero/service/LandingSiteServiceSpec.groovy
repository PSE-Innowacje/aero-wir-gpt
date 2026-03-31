package pl.pse.aero.service

import pl.pse.aero.domain.LandingSite
import pl.pse.aero.dto.LandingSiteRequest
import pl.pse.aero.repository.LandingSiteRepository
import spock.lang.Specification

class LandingSiteServiceSpec extends Specification {

    LandingSiteRepository repository = Mock()
    LandingSiteService service = new LandingSiteService(repository)

    def "findAll should return landing sites sorted by name"() {
        given:
        def s1 = LandingSite.builder().name("Radom EPRA").latitude(51.3892).longitude(21.2133).build()
        def s2 = LandingSite.builder().name("Babice EPBC").latitude(52.1847).longitude(20.9111).build()
        def s3 = LandingSite.builder().name("Modlin EPMO").latitude(52.4511).longitude(20.6517).build()
        repository.findAll() >> [s1, s2, s3]

        when:
        def result = service.findAll()

        then:
        result*.name == ["Babice EPBC", "Modlin EPMO", "Radom EPRA"]
    }

    def "findById should return landing site when found"() {
        given:
        def site = LandingSite.builder().id("ls1").name("Babice EPBC").latitude(52.1847).longitude(20.9111).build()
        repository.findById("ls1") >> Optional.of(site)

        when:
        def result = service.findById("ls1")

        then:
        result.name == "Babice EPBC"
    }

    def "findById should throw when not found"() {
        given:
        repository.findById("missing") >> Optional.empty()

        when:
        service.findById("missing")

        then:
        thrown(NoSuchElementException)
    }

    def "create should save landing site with valid data"() {
        given:
        def request = LandingSiteRequest.builder()
                .name("Babice EPBC")
                .latitude(52.1847)
                .longitude(20.9111)
                .build()
        repository.save(_) >> { LandingSite ls -> ls }

        when:
        def result = service.create(request)

        then:
        result.name == "Babice EPBC"
        result.latitude == 52.1847
        result.longitude == 20.9111
    }

    def "update should modify existing landing site"() {
        given:
        def existing = LandingSite.builder().id("ls1").name("Old Name").latitude(50.0).longitude(20.0).build()
        repository.findById("ls1") >> Optional.of(existing)
        repository.save(_) >> { LandingSite ls -> ls }

        def request = LandingSiteRequest.builder()
                .name("Babice EPBC")
                .latitude(52.1847)
                .longitude(20.9111)
                .build()

        when:
        def result = service.update("ls1", request)

        then:
        result.id == "ls1"
        result.name == "Babice EPBC"
        result.latitude == 52.1847
        result.longitude == 20.9111
    }
}
