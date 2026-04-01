package pl.pse.aero.service

import org.springframework.mock.web.MockMultipartFile
import spock.lang.Specification

class KmlServiceSpec extends Specification {

    KmlService service = new KmlService()

    def validKml(String coordinates) {
        return """<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
            <Document><Placemark><LineString><coordinates>
            $coordinates
            </coordinates></LineString></Placemark></Document></kml>"""
    }

    def "should parse KML bytes and extract lat/lng points"() {
        given:
        def kml = validKml("20.0,52.0,0 20.1,52.1,0 20.2,52.2,0")

        when:
        def points = service.parseKml(kml.bytes)

        then:
        points.size() == 3
        points[0][0] == 52.0d
        points[0][1] == 20.0d
        points[2][0] == 52.2d
        points[2][1] == 20.2d
    }

    def "parseAndValidate from MultipartFile should return content, fileName, and points"() {
        given:
        def kml = validKml("20.0,52.0,0 20.1,52.1,0")
        def file = new MockMultipartFile("file", "route.kml", "application/xml", kml.bytes)

        when:
        def result = service.parseAndValidate(file)

        then:
        result.fileContent() == kml.bytes
        result.fileName() == "route.kml"
        result.points().size() == 2
        result.routeLengthKm() >= 0
    }

    def "parseAndValidate from byte array should return content and points"() {
        given:
        def kml = validKml("20.0,52.0,0 20.1,52.1,0")

        when:
        def result = service.parseAndValidate(kml.bytes, "test.kml")

        then:
        result.fileContent() == kml.bytes
        result.fileName() == "test.kml"
        result.points().size() == 2
    }

    def "should reject KML with more than 5000 points"() {
        given:
        def points = (1..5001).collect { [52.0d, 20.0d] as double[] }

        when:
        service.validatePoints(points)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("5001")
        ex.message.contains("5000")
    }

    def "should reject points outside Poland bounding box"() {
        given:
        def points = [[48.0d, 20.0d] as double[]]

        when:
        service.validatePoints(points)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("outside Poland")
    }

    def "should accept points within Poland bounding box"() {
        given:
        def points = [
                [52.0d, 20.0d] as double[],
                [51.0d, 19.0d] as double[],
                [54.0d, 18.0d] as double[]
        ]

        when:
        service.validatePoints(points)

        then:
        noExceptionThrown()
    }

    def "should calculate route length via Haversine"() {
        given:
        def points = [
                [52.23d, 21.01d] as double[],
                [50.06d, 19.94d] as double[]
        ]

        when:
        def km = service.calculateRouteLength(points)

        then:
        km >= 245 && km <= 260
    }

    def "should return 0 km for single point"() {
        expect:
        service.calculateRouteLength([[52.0d, 20.0d] as double[]]) == 0
    }

    def "should throw on malformed XML"() {
        when:
        service.parseKml("not xml".bytes)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Failed to parse")
    }

    def "should throw on KML with no coordinates"() {
        given:
        def kml = """<?xml version="1.0"?><kml><Document></Document></kml>"""

        when:
        service.parseKml(kml.bytes)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("no coordinates")
    }
}
