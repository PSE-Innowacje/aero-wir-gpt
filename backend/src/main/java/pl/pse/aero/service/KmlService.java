package pl.pse.aero.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.NodeList;
import pl.pse.aero.dto.KmlProcessingResult;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class KmlService {

    private static final int MAX_POINTS = 5000;
    private static final double MIN_LAT = 49.0;
    private static final double MAX_LAT = 54.9;
    private static final double MIN_LNG = 14.1;
    private static final double MAX_LNG = 24.2;
    private static final double EARTH_RADIUS_KM = 6371.0;

    private final String uploadDir;

    public KmlService(@Value("${app.upload-dir}") String uploadDir) {
        this.uploadDir = uploadDir;
    }

    public KmlProcessingResult saveAndParse(MultipartFile file) {
        String filePath = saveFile(file);
        List<double[]> points = parseKml(file);
        validatePoints(points);
        int routeLengthKm = calculateRouteLength(points);
        return new KmlProcessingResult(filePath, points, routeLengthKm);
    }

    String saveFile(MultipartFile file) {
        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);
            String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = dir.resolve(filename);
            file.transferTo(target);
            return target.toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save KML file: " + e.getMessage(), e);
        }
    }

    List<double[]> parseKml(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
            DocumentBuilder builder = factory.newDocumentBuilder();
            Document doc = builder.parse(is);

            NodeList coordinateNodes = doc.getElementsByTagName("coordinates");
            List<double[]> points = new ArrayList<>();

            for (int i = 0; i < coordinateNodes.getLength(); i++) {
                String text = coordinateNodes.item(i).getTextContent().trim();
                for (String triplet : text.split("\\s+")) {
                    String trimmed = triplet.trim();
                    if (trimmed.isEmpty()) continue;
                    String[] parts = trimmed.split(",");
                    if (parts.length < 2) continue;
                    double lng = Double.parseDouble(parts[0].trim());
                    double lat = Double.parseDouble(parts[1].trim());
                    points.add(new double[]{lat, lng});
                }
            }

            if (points.isEmpty()) {
                throw new IllegalArgumentException("KML file contains no coordinates");
            }

            return points;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to parse KML file: " + e.getMessage(), e);
        }
    }

    void validatePoints(List<double[]> points) {
        if (points.size() > MAX_POINTS) {
            throw new IllegalArgumentException(
                    "KML file contains " + points.size() + " points, maximum is " + MAX_POINTS);
        }

        for (double[] point : points) {
            double lat = point[0];
            double lng = point[1];
            if (lat < MIN_LAT || lat > MAX_LAT || lng < MIN_LNG || lng > MAX_LNG) {
                throw new IllegalArgumentException(
                        "Point (" + lat + ", " + lng + ") is outside Poland bounding box " +
                                "(lat " + MIN_LAT + "-" + MAX_LAT + ", lng " + MIN_LNG + "-" + MAX_LNG + ")");
            }
        }
    }

    int calculateRouteLength(List<double[]> points) {
        double totalKm = 0;
        for (int i = 1; i < points.size(); i++) {
            totalKm += haversine(points.get(i - 1), points.get(i));
        }
        return (int) Math.round(totalKm);
    }

    static double haversine(double[] a, double[] b) {
        double lat1 = Math.toRadians(a[0]);
        double lat2 = Math.toRadians(b[0]);
        double dLat = Math.toRadians(b[0] - a[0]);
        double dLng = Math.toRadians(b[1] - a[1]);

        double h = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1) * Math.cos(lat2)
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
    }
}
