package pl.pse.aero.domain

import spock.lang.Specification

class LandingSiteSpec extends Specification {

    def "should create landing site with all fields via builder"() {
        when:
        def site = LandingSite.builder()
                .id("ls1")
                .name("Babice EPBC")
                .latitude(52.1847)
                .longitude(20.9111)
                .build()

        then:
        site.id == "ls1"
        site.name == "Babice EPBC"
        site.latitude == 52.1847
        site.longitude == 20.9111
    }

    def "should create landing site with no-arg constructor"() {
        when:
        def site = new LandingSite()
        site.setName("Modlin EPMO")
        site.setLatitude(52.4511)
        site.setLongitude(20.6517)

        then:
        site.id == null
        site.name == "Modlin EPMO"
        site.latitude == 52.4511
        site.longitude == 20.6517
    }
}
