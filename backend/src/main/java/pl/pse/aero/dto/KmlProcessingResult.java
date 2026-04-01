package pl.pse.aero.dto;

import java.util.List;

public record KmlProcessingResult(
        byte[] fileContent,
        String fileName,
        List<double[]> points,
        int routeLengthKm
) {}
