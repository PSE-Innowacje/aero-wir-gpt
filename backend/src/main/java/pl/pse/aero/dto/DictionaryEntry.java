package pl.pse.aero.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class DictionaryEntry {
    private String value;
    private String label;
}
