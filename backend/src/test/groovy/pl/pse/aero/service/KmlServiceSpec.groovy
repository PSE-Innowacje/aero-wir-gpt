package pl.pse.aero.service

import org.springframework.mock.web.MockMultipartFile
import spock.lang.Specification
import spock.lang.TempDir

import java.nio.file.Path

class KmlServiceSpec extends Specification {

    @TempDir
    Path tempDir

    KmlService service

    def setup() {
        service = new KmlService(tempDir.toString())
    }

    def validKml(String coordinates) {
        return """<?xml version="1.0" encoding="UTF-8"?>
            <kml xmlns="http://www.opengis.net/kml/2.2">
            <Document><Placemark><LineString><coordinates>
            $coordinates
            </coordinates></LineString></Placemark></Document></kml>"""
    }

    def "should parse KML and extract lat/lng points"() {
        given:
        def kml = validKml("20.0,52.0,0 20.1,52.1,0 20.2,52.2,0")
        def file = new MockMultipartFile("file", "test.kml", "application/xml", kml.bytes)

        when:
        def points = service.parseKml(file)

        then:
        points.size() == 3
        points[0][0] == 52.0d  // lat
        points[0][1] == 20.0d  // lng
        points[2][0] == 52.2d
        points[2][1] == 20.2d
    }

    def "should save file with UUID prefix"() {
        given:
        def file = new MockMultipartFile("file", "route.kml", "application/xml", "content".bytes)

        when:
        def path = service.saveFile(file)

        then:
        path.contains("route.kml")
        path.contains("_")
        new File(path).exists()
    }

    def "should reject KML with more than 5000 points"() {
        given:
        def coords = (1..5001).collect { "20.0,52.0,0" }.join(" ")
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
        def points = [[48.0d, 20.0d] as double[]]  // lat 48 is south of Poland

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
        // Warsaw (52.23, 21.01) to Krakow (50.06, 19.94) ~ 252 km
        def points = [
                [52.23d, 21.01d] as double[],
                [50.06d, 19.94d] as double[]
        ]

        when:
        def km = service.calculateRouteLength(points)

        then:
        km >= 245 && km <= 260  // approximate
    }

    def "should return 0 km for single point"() {
        given:
        def points = [[52.0d, 20.0d] as double[]]

        when:
        def km = service.calculateRouteLength(points)

        then:
        km == 0
    }

    def "should throw on malformed XML"() {
        given:
        def file = new MockMultipartFile("file", "bad.kml", "application/xml", "not xml".bytes)

        when:
        service.parseKml(file)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("Failed to parse")
    }

    def "should throw on KML with no coordinates"() {
        given:
        def kml = """<?xml version="1.0"?><kml><Document></Document></kml>"""
        def file = new MockMultipartFile("file", "empty.kml", "application/xml", kml.bytes)

        when:
        service.parseKml(file)

        then:
        def ex = thrown(IllegalArgumentException)
        ex.message.contains("no coordinates")
    }

    def "full saveAndParse should return KmlProcessingResult"() {
        given:
        def kml = validKml("20.0,52.0,0 20.1,52.1,0")
        def file = new MockMultipartFile("file", "full.kml", "application/xml", kml.bytes)

        when:
        def result = service.saveAndParse(file)

        then:
        result.filePath().contains("full.kml")
        result.points().size() == 2
        result.routeLengthKm() >= 0
    }
}
