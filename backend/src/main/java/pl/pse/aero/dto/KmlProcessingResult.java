package pl.pse.aero.dto;

import java.util.List;

public record KmlProcessingResult(
        String filePath,
        List<double[]> points,
        int routeLengthKm
) {}
