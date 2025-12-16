package com.example.backend.Infrastructure.Filtering;

import com.example.backend.Domain.DTOs.ProductFilter;
import org.springframework.util.MultiValueMap;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.function.BiConsumer;

public class FilterParser {
    private static final Map<String, BiConsumer<ProductFilter,String>> PREFIX_MAP =
            Map.ofEntries(
                    Map.entry("category", (f,v) -> f.categories.add(v)),
                    Map.entry("breed", (f,v) -> f.breeds.add(v)),
                    Map.entry("country", (f,v) -> f.countries.add(v)),
                    Map.entry("typeoffood", (f,v) -> f.typeOfFood.add(v)),
                    Map.entry("taste", (f,v) -> f.flavors.add(v)),
                    Map.entry("flavor", (f,v) -> f.flavors.add(v)),
                    Map.entry("brand", (f,v) -> f.brands.add(v)),
                    Map.entry("color", (f,v) -> f.variantColors.add(v)),
                    Map.entry("scent", (f,v) -> f.variantScents.add(v)),
                    Map.entry("producttype", (f,v) -> f.productTypes.add(v))
            );

    public static ProductFilter parseFromParams(MultiValueMap<String, String> params) {
        ProductFilter filter = new ProductFilter();

        if (params.containsKey("minPrice")) {
            try {
                filter.minPrice = new BigDecimal(params.getFirst("minPrice"));
            } catch (NumberFormatException e) {
                // игнорируем невалидные значения
            }
        }

        if (params.containsKey("maxPrice")) {
            try {
                filter.maxPrice = new BigDecimal(params.getFirst("maxPrice"));
            } catch (NumberFormatException e) {
                // игнорируем невалидные значения
            }
        }

        for (Map.Entry<String, List<String>> e : params.entrySet()) {
            String key = e.getKey();
            List<String> vals = e.getValue();

            boolean enabled = vals.stream().anyMatch(v -> v == null || v.equalsIgnoreCase("true") || v.equals("1"));
            if (!enabled) continue;

            int underscore = key.indexOf('_');
            if (underscore <= 0) continue;
            String prefix = key.substring(0, underscore).toLowerCase();
            String suffix = key.substring(underscore + 1).toLowerCase();

            var consumer = PREFIX_MAP.get(prefix);
            if (consumer != null) {
                consumer.accept(filter, suffix);
            } else {

                // ("country_germany" -> try "country")
            }
        }

        return filter;
    }

    public static ProductFilter parseFromUrlString(String url) {
        if (url == null || url.isBlank()) return new ProductFilter();
        URI uri = URI.create(url);
        MultiValueMap<String, String> params = UriComponentsBuilder.fromUri(uri).build().getQueryParams();
        return parseFromParams(params);
    }


}
