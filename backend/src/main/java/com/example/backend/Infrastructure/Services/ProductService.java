package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.DTOs.*;
import com.example.backend.Domain.Models.*;
import com.example.backend.Infrastructure.Exceptions.InvalidRequestException;
import com.example.backend.Infrastructure.Exceptions.ResourceAlreadyExistsException;
import com.example.backend.Infrastructure.Filtering.FilterParser;
import com.example.backend.Infrastructure.Filtering.ProductSpecificationBuilder;
import com.example.backend.Infrastructure.Repos.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.*;

@Service
public class ProductService {
    private ProductImagesService productImagesService;
    private final ProductRepository productRepository;
    private final ProductImageRepository productImageRepository;
    private final BreedRepository breedRepository;
    private final BreedsService breedsService;
    private final CategoryRepository categoryRepository;
    private final CountryRepository  countryRepository;
    private final TypeoffoodRepository  typeoffoodRepository;
    private final BrandRepository  brandRepository;
    private final FlavorRepository  flavorRepository;
    private final ProductTypeRepository productTypeRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ColorRepository  colorRepository;
    private final ScentRepository scentRepository;
    private static final String FLAVOR_SPLIT_REGEX = "\\s*(?:\\+|,|/|\\band\\b|\\bи\\b|\\bс\\b)\\s*"; // разделители
    
    // Словарь синонимов для поиска
    private static final Map<String, List<String>> SEARCH_SYNONYMS = createSynonymsMap();
    
    private static Map<String, List<String>> createSynonymsMap() {
        Map<String, List<String>> synonyms = new HashMap<>();
        
        // Общие слова
        synonyms.put("все", List.of("всех", "всем", "всеми", "всего", "для всех"));
        synonyms.put("для всех", List.of("все", "всех", "всем", "всеми", "всего"));
        synonyms.put("породы", List.of("пород", "породам", "породами", "породе"));
        synonyms.put("все породы", List.of("для всех", "для всех пород", "всех пород", "всем породам", "все пород", "все породы"));
        
        // Кошки
        synonyms.put("кошка", List.of("кошки", "кошек", "кошкам", "кошками", "кошке", "для кошек"));
        synonyms.put("кошки", List.of("кошка", "кошек", "кошкам", "кошками", "кошке", "для кошек"));
        synonyms.put("кошек", List.of("кошка", "кошки", "кошкам", "кошками", "кошке", "для кошек"));
        synonyms.put("для кошек", List.of("кошка", "кошки", "кошек", "кошкам", "кошками"));
        
        // Котята
        synonyms.put("котенок", List.of("котят", "котенка", "котенку", "котенком", "котятам", "для котят", "котята"));
        synonyms.put("котят", List.of("котенок", "котенка", "котенку", "котенком", "котятам", "для котят", "котята"));
        synonyms.put("котята", List.of("котенок", "котят", "котенка", "котенку", "котенком", "котятам", "для котят"));
        synonyms.put("для котят", List.of("котенок", "котенка", "котенку", "котенком", "котятам", "котят", "котята"));
        
        // Собаки
        synonyms.put("собака", List.of("собаки", "собак", "собакам", "собаками", "собаке", "для собак"));
        synonyms.put("собаки", List.of("собака", "собак", "собакам", "собаками", "собаке", "для собак"));
        synonyms.put("собак", List.of("собака", "собаки", "собакам", "собаками", "собаке", "для собак"));
        synonyms.put("для собак", List.of("собака", "собаки", "собак", "собакам", "собаками"));
        
        // Щенки
        synonyms.put("щенок", List.of("щенков", "щенка", "щенку", "щенком", "щенкам", "для щенков", "щенки"));
        synonyms.put("щенков", List.of("щенок", "щенка", "щенку", "щенком", "щенкам", "для щенков", "щенки"));
        synonyms.put("щенки", List.of("щенок", "щенков", "щенка", "щенку", "щенком", "щенкам", "для щенков"));
        synonyms.put("для щенков", List.of("щенок", "щенка", "щенку", "щенком", "щенкам", "щенков", "щенки"));
        
        // Породы собак - мелкие
        synonyms.put("мелкие", List.of("мелких", "мелким", "мелкие породы", "для мелких пород", "мелких пород"));
        synonyms.put("мелких", List.of("мелкие", "мелким", "мелкие породы", "для мелких пород"));
        synonyms.put("мелкие породы", List.of("мелких пород", "для мелких пород", "мелким породам", "мелкие пород", "мелкие", "мелких"));
        synonyms.put("мелких пород", List.of("мелкие породы", "для мелких пород", "мелким породам", "мелкие", "мелких"));
        synonyms.put("для мелких пород", List.of("мелкие породы", "мелких пород", "мелким породам", "мелкие", "мелких"));
        synonyms.put("мелким породам", List.of("мелкие породы", "мелких пород", "для мелких пород", "мелкие"));
        
        // Породы собак - средние
        synonyms.put("средние", List.of("средних", "средним", "средние породы", "для средних пород", "средних пород"));
        synonyms.put("средних", List.of("средние", "средним", "средние породы", "для средних пород"));
        synonyms.put("средние породы", List.of("средних пород", "для средних пород", "средним породам", "средние пород", "средние", "средних"));
        synonyms.put("средних пород", List.of("средние породы", "для средних пород", "средним породам", "средние", "средних"));
        synonyms.put("для средних пород", List.of("средние породы", "средних пород", "средним породам", "средние", "средних"));
        synonyms.put("средним породам", List.of("средние породы", "средних пород", "для средних пород", "средние"));
        
        // Породы собак - крупные
        synonyms.put("крупные", List.of("крупных", "крупным", "крупные породы", "для крупных пород", "крупных пород"));
        synonyms.put("крупных", List.of("крупные", "крупным", "крупные породы", "для крупных пород"));
        synonyms.put("крупные породы", List.of("крупных пород", "для крупных пород", "крупным породам", "крупные пород", "крупные", "крупных"));
        synonyms.put("крупных пород", List.of("крупные породы", "для крупных пород", "крупным породам", "крупные", "крупных"));
        synonyms.put("для крупных пород", List.of("крупные породы", "крупных пород", "крупным породам", "крупные", "крупных"));
        synonyms.put("крупным породам", List.of("крупные породы", "крупных пород", "для крупных пород", "крупные"));
        
        // Стерилизованные
        synonyms.put("стерилизованные", List.of("стерилизованным", "стерилизованным кошкам", "для стерилизованных", "для стерилизованных кошек", "стерилизованным котам"));
        synonyms.put("стерилизованных", List.of("стерилизованным", "стерилизованным кошкам", "для стерилизованных", "стерилизованные", "стерилизованным котам"));
        synonyms.put("для стерилизованных", List.of("стерилизованным", "стерилизованным кошкам", "для стерилизованных кошек", "стерилизованные", "стерилизованным котам"));
        synonyms.put("стерилизованным", List.of("стерилизованные", "стерилизованных", "для стерилизованных"));
        
        // Здоровье кожи и шерсти
        synonyms.put("для здоровья кожи и шерсти", List.of("здоровье кожи", "кожа и шерсть", "для кожи", "для шерсти", "здоровье шерсти"));
        synonyms.put("здоровье кожи", List.of("для здоровья кожи и шерсти", "кожа и шерсть", "для кожи"));
        synonyms.put("кожа и шерсть", List.of("для здоровья кожи и шерсти", "здоровье кожи", "для шерсти"));
        synonyms.put("для кожи", List.of("для здоровья кожи и шерсти", "здоровье кожи", "кожа и шерсть"));
        synonyms.put("для шерсти", List.of("для здоровья кожи и шерсти", "кожа и шерсть", "здоровье шерсти"));
        
        // Чувствительный
        synonyms.put("чувствительный", List.of("чувствительного", "чувствительному", "чувствительным", "чувствительная", "чувствительной", "для чувствительного", "с чувствительным"));
        synonyms.put("чувствительного", List.of("чувствительный", "чувствительному", "чувствительным", "для чувствительного", "с чувствительным"));
        synonyms.put("для чувствительного", List.of("чувствительный", "чувствительного", "чувствительному", "чувствительным", "с чувствительным"));
        synonyms.put("для чувствительного пищеварения", List.of("чувствительный", "чувствительного", "чувствительное пищеварение", "для чувствительного", "чувствительным"));
        synonyms.put("чувствительное пищеварение", List.of("для чувствительного пищеварения", "чувствительный", "чувствительного"));
        synonyms.put("с чувствительным", List.of("чувствительный", "чувствительного", "чувствительному", "чувствительным", "для чувствительного"));
        synonyms.put("чувствительным", List.of("чувствительный", "чувствительного", "чувствительному", "для чувствительного"));
        
        // Привередливые
        synonyms.put("для привередливых", List.of("привередливые", "привередливым", "привередливых"));
        synonyms.put("привередливые", List.of("для привередливых", "привередливым", "привередливых"));
        synonyms.put("привередливым", List.of("для привередливых", "привередливые", "привередливых"));
        synonyms.put("привередливых", List.of("для привередливых", "привередливые", "привередливым"));
        
        // Домашние (indoor)
        synonyms.put("для домашних", List.of("домашние", "домашним", "индор", "для домашних кошек", "индор кошки"));
        synonyms.put("домашние", List.of("для домашних", "домашним", "индор"));
        synonyms.put("домашним", List.of("для домашних", "домашние"));
        synonyms.put("индор", List.of("для домашних", "домашние", "индор кошки"));
        synonyms.put("indoor", List.of("для домашних", "домашние", "индор"));
        
        // Типы корма
        synonyms.put("сухой", List.of("сухого", "сухому", "сухим", "сухого корма", "сухой корм"));
        synonyms.put("сухого", List.of("сухой", "сухому", "сухим", "сухого корма"));
        synonyms.put("сухой корм", List.of("сухой", "сухого", "сухого корма"));
        synonyms.put("сухого корма", List.of("сухой", "сухого", "сухой корм"));
        
        synonyms.put("влажный", List.of("влажного", "влажному", "влажным", "влажного корма", "влажный корм"));
        synonyms.put("влажного", List.of("влажный", "влажному", "влажным", "влажного корма"));
        synonyms.put("влажный корм", List.of("влажный", "влажного", "влажного корма"));
        synonyms.put("влажного корма", List.of("влажный", "влажного", "влажный корм"));
        
        synonyms.put("консервы", List.of("консерв", "консервам", "консервами", "консервов"));
        synonyms.put("консерв", List.of("консервы", "консервам", "консервов"));
        
        // Типы продуктов
        synonyms.put("корм", List.of("корма", "корму", "кормом", "кормам", "кормами"));
        synonyms.put("корма", List.of("корм", "корму", "кормом"));
        
        synonyms.put("наполнитель", List.of("наполнителя", "наполнителю", "наполнителем", "наполнителям"));
        synonyms.put("наполнителя", List.of("наполнитель", "наполнителю", "наполнителем"));
        
        synonyms.put("аксессуары", List.of("аксессуар", "аксессуаров", "аксессуарам", "аксессуарами"));
        synonyms.put("аксессуар", List.of("аксессуары", "аксессуаров", "аксессуарам"));
        
        // Вкусы - мясо
        synonyms.put("кролик", List.of("кролика", "кролику", "кроликом"));
        synonyms.put("кролика", List.of("кролик", "кролику", "кроликом"));
        
        synonyms.put("курица", List.of("курицы", "курице", "курицей", "куриц", "курицам", "куриное", "куриного"));
        synonyms.put("курицы", List.of("курица", "курице", "курицей"));
        synonyms.put("куриное", List.of("курица", "курицы", "куриного"));
        synonyms.put("куриного", List.of("курица", "курицы", "куриное"));
        
        synonyms.put("куропатка", List.of("куропатки", "куропатке", "куропаткой"));
        synonyms.put("куропатки", List.of("куропатка", "куропатке", "куропаткой"));
        
        synonyms.put("перепелка", List.of("перепелки", "перепелке", "перепелкой", "перепелок"));
        synonyms.put("перепелки", List.of("перепелка", "перепелке", "перепелкой"));
        
        synonyms.put("телятина", List.of("телятины", "телятине", "телятиной"));
        synonyms.put("телятины", List.of("телятина", "телятине", "телятиной"));
        
        synonyms.put("ягненок", List.of("ягненка", "ягненку", "ягненком", "ягнят", "ягнята"));
        synonyms.put("ягненка", List.of("ягненок", "ягненку", "ягненком"));
        synonyms.put("ягнята", List.of("ягненок", "ягненка", "ягнят"));
        
        synonyms.put("гусь", List.of("гуся", "гусю", "гусем", "гусей"));
        synonyms.put("гуся", List.of("гусь", "гусю", "гусем"));
        
        synonyms.put("утка", List.of("утки", "утке", "уткой", "уток"));
        synonyms.put("утки", List.of("утка", "утке", "уткой"));
        
        synonyms.put("говядина", List.of("говядины", "говядине", "говядиной", "говяжье", "говяжьего"));
        synonyms.put("говядины", List.of("говядина", "говядине", "говядиной"));
        synonyms.put("говяжье", List.of("говядина", "говядины", "говяжьего"));
        synonyms.put("говяжьего", List.of("говядина", "говядины", "говяжье"));
        
        synonyms.put("индейка", List.of("индейки", "индейке", "индейкой", "индеек", "индюшатина", "индюшатины"));
        synonyms.put("индейки", List.of("индейка", "индейке", "индейкой"));
        synonyms.put("индюшатина", List.of("индейка", "индейки", "индюшатины"));
        
        // Вкусы - рыба
        synonyms.put("лосось", List.of("лосося", "лососю", "лососем", "лососей", "лососевый", "лососевого"));
        synonyms.put("лосося", List.of("лосось", "лососю", "лососем"));
        synonyms.put("лососевый", List.of("лосось", "лосося", "лососевого"));
        
        synonyms.put("рыба", List.of("рыбы", "рыбе", "рыбой", "рыб", "рыбам", "рыбный", "рыбного"));
        synonyms.put("рыбы", List.of("рыба", "рыбе", "рыбой"));
        synonyms.put("рыбный", List.of("рыба", "рыбы", "рыбного"));
        
        // Запахи
        synonyms.put("классический", List.of("классического", "классическому", "классическим", "классическая", "классической"));
        synonyms.put("классического", List.of("классический", "классическому", "классическим"));
        
        synonyms.put("ванильный", List.of("ванильного", "ванильному", "ванильным", "ванильная", "ванильной", "ваниль"));
        synonyms.put("ванильного", List.of("ванильный", "ванильному", "ванильным"));
        synonyms.put("ваниль", List.of("ванильный", "ванильного"));
        
        synonyms.put("банановый", List.of("бананового", "банановому", "банановым", "банановая", "банановой", "банан"));
        synonyms.put("бананового", List.of("банановый", "банановому", "банановым"));
        synonyms.put("банан", List.of("банановый", "бананового"));
        
        synonyms.put("кокосовый", List.of("кокосового", "кокосовому", "кокосовым", "кокосовая", "кокосовой", "кокос"));
        synonyms.put("кокосового", List.of("кокосовый", "кокосовому", "кокосовым"));
        synonyms.put("кокос", List.of("кокосовый", "кокосового"));
        
        synonyms.put("зеленый чай", List.of("зеленого чая", "зеленому чаю", "зеленым чаем"));
        synonyms.put("зеленого чая", List.of("зеленый чай", "зеленому чаю", "зеленым чаем"));
        
        synonyms.put("аромат розы", List.of("аромата розы", "аромату розы", "ароматом розы", "роза", "розовый", "розового"));
        synonyms.put("аромата розы", List.of("аромат розы", "аромату розы", "ароматом розы"));
        synonyms.put("роза", List.of("аромат розы", "аромата розы", "розовый"));
        synonyms.put("розовый", List.of("аромат розы", "аромата розы", "роза"));
        
        synonyms.put("яблоко", List.of("яблока", "яблоку", "яблоком", "яблок", "яблочный", "яблочного"));
        synonyms.put("яблока", List.of("яблоко", "яблоку", "яблоком"));
        synonyms.put("яблочный", List.of("яблоко", "яблока", "яблочного"));
        
        synonyms.put("лимон", List.of("лимона", "лимону", "лимоном", "лимоны", "лимонов", "лимонный", "лимонного"));
        synonyms.put("лимона", List.of("лимон", "лимону", "лимоном"));
        synonyms.put("лимонный", List.of("лимон", "лимона", "лимонного"));
        
        synonyms.put("без аромата", List.of("без запаха", "нейтральный"));
        synonyms.put("без запаха", List.of("без аромата", "нейтральный"));
        synonyms.put("нейтральный", List.of("без аромата", "без запаха"));
        
        synonyms.put("молоко", List.of("молока", "молоку", "молоком", "молочный", "молочного"));
        synonyms.put("молока", List.of("молоко", "молоку", "молоком"));
        synonyms.put("молочный", List.of("молоко", "молока", "молочного"));
        
        synonyms.put("лаванда", List.of("лаванды", "лаванде", "лавандой", "лавандовый", "лавандового"));
        synonyms.put("лаванды", List.of("лаванда", "лаванде", "лавандой"));
        synonyms.put("лавандовый", List.of("лаванда", "лаванды", "лавандового"));
        
        // Страны
        synonyms.put("испания", List.of("испании", "испанский", "испанского"));
        synonyms.put("испании", List.of("испания", "испанский"));
        synonyms.put("испанский", List.of("испания", "испании"));
        
        synonyms.put("германия", List.of("германии", "немецкий", "немецкого"));
        synonyms.put("германии", List.of("германия", "немецкий"));
        synonyms.put("немецкий", List.of("германия", "германии"));
        
        synonyms.put("россия", List.of("россии", "российский", "российского"));
        synonyms.put("россии", List.of("россия", "российский"));
        synonyms.put("российский", List.of("россия", "россии"));
        
        synonyms.put("беларусь", List.of("беларуси", "белорусский", "белорусского"));
        synonyms.put("беларуси", List.of("беларусь", "белорусский"));
        synonyms.put("белорусский", List.of("беларусь", "беларуси"));
        
        synonyms.put("китай", List.of("китая", "китаю", "китаем", "китайский", "китайского"));
        synonyms.put("китая", List.of("китай", "китайский"));
        synonyms.put("китайский", List.of("китай", "китая"));
        
        // Бренды
        synonyms.put("landor", List.of("ландор"));
        synonyms.put("ландор", List.of("landor"));
        
        synonyms.put("landy", List.of("ленди"));
        synonyms.put("ленди", List.of("landy"));
        
        synonyms.put("fresh pet profbalance", List.of("freshpet", "profbalance", "фреш пет"));
        synonyms.put("freshpet", List.of("fresh pet profbalance", "profbalance"));
        synonyms.put("profbalance", List.of("fresh pet profbalance", "freshpet"));
        
        synonyms.put("чистые пушистые", List.of("чистые", "пушистые"));
        synonyms.put("чистые", List.of("чистые пушистые"));
        synonyms.put("пушистые", List.of("чистые пушистые"));
        
        return synonyms;
    }
    
    // Метод для расширения запроса синонимами
    private Set<String> expandSearchTerms(String query) {
        Set<String> terms = new HashSet<>();
        terms.add(query); // Добавляем исходный запрос
        
        // Разбиваем запрос на слова
        String[] words = query.split("\\s+");
        
        // Обрабатываем каждое слово отдельно
        for (String word : words) {
            if (word.length() <= 1) continue;
            
            terms.add(word); // Добавляем само слово
            
            // Прямой поиск в словаре
            if (SEARCH_SYNONYMS.containsKey(word)) {
                terms.addAll(SEARCH_SYNONYMS.get(word));
            }
            
            // Обратный поиск: ищем ключи, в значениях которых есть это слово
            for (Map.Entry<String, List<String>> entry : SEARCH_SYNONYMS.entrySet()) {
                String key = entry.getKey();
                List<String> values = entry.getValue();
                
                // Если слово найдено в списке синонимов какого-то ключа, добавляем этот ключ и все его синонимы
                if (values.contains(word)) {
                    terms.add(key);
                    terms.addAll(values);
                }
            }
            
            // Ищем ключи, которые совпадают или содержат это слово
            for (Map.Entry<String, List<String>> entry : SEARCH_SYNONYMS.entrySet()) {
                String key = entry.getKey();
                
                // Точное совпадение
                if (key.equals(word)) {
                    terms.add(key);
                    terms.addAll(entry.getValue());
                    continue;
                }
                
                // Ключ содержит слово (например, ключ "для щенков" содержит "щенков")
                if (key.contains(word)) {
                    terms.add(key);
                    terms.addAll(entry.getValue());
                }
            }
        }
        
        // Также проверяем весь запрос целиком
        if (SEARCH_SYNONYMS.containsKey(query)) {
            terms.addAll(SEARCH_SYNONYMS.get(query));
        }
        
        // Проверяем ключи фраз (многословные ключи)
        for (Map.Entry<String, List<String>> entry : SEARCH_SYNONYMS.entrySet()) {
            String key = entry.getKey();
            
            // Если запрос содержит ключ
            if (query.contains(key)) {
                terms.add(key);
                terms.addAll(entry.getValue());
            }
            
            // Если ключ содержит запрос
            if (key.contains(query)) {
                terms.add(key);
                terms.addAll(entry.getValue());
            }
        }
        
        return terms;
    }
    @Autowired
    public ProductService(ProductRepository productRepository, ProductImageRepository productImageRepository,
                          BreedRepository breedRepository,
                          CategoryRepository categoryRepository,
                          CountryRepository  countryRepository,
                          TypeoffoodRepository  typeoffoodRepository,
                          BreedsService breedsService,
                          ProductImagesService productImagesService,
                          BrandRepository  brandRepository,
                          FlavorRepository  flavorRepository,
                          ProductTypeRepository productTypeRepository,
                          ProductVariantRepository productVariantRepository,
                          ColorRepository colorRepository,
                          ScentRepository scentRepository
    ) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
        this.breedRepository = breedRepository;
        this.categoryRepository = categoryRepository;
        this.countryRepository = countryRepository;
        this.typeoffoodRepository = typeoffoodRepository;
        this.breedsService = breedsService;
        this.productImagesService = productImagesService;
        this.brandRepository = brandRepository;
        this.flavorRepository = flavorRepository;
        this.productTypeRepository = productTypeRepository;
        this.productVariantRepository = productVariantRepository;
        this.colorRepository = colorRepository;
        this.scentRepository = scentRepository;
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(long id) {
        if (productRepository.findById(id).isPresent()) {return productRepository.findById(id);}
        else {throw new InvalidRequestException("Product not found");}
    }

    public List<Product> findByIsActive(Boolean isActive) {
        return productRepository.findByIsActive(isActive);
    }

    @Transactional
    public Product update(Long id, UpdateProductDTO updatedproduct) {
        Product currentproduct = productRepository.findById(id)
                .orElseThrow(() -> new InvalidRequestException("Product with id " + id + " does not exist"));

        Map<Long, ProductVariant> existingById = new HashMap<>();
        Map<String, ProductVariant> existingBySku = new HashMap<>();
        for (ProductVariant pv : currentproduct.getProductVariants()) {
            if (pv.getId() != null) existingById.put(pv.getId(), pv);
            if (pv.getSku() != null) existingBySku.put(pv.getSku(), pv);
        }

        currentproduct.setName(updatedproduct.name());
        currentproduct.setDescription(updatedproduct.description());
        currentproduct.setFeedingNote(updatedproduct.feedingNote());
        currentproduct.setGuaranteedIndicators(updatedproduct.guaranteedIndicators());
        currentproduct.setSlug(updatedproduct.slug());
        currentproduct.setIsActive(updatedproduct.isActive());
        currentproduct.setRating(updatedproduct.rating());
        currentproduct.setIsFeatured(updatedproduct.isFeatured());
        currentproduct.setBrand(brandRepository.findById(updatedproduct.brandId()).orElse(null));
        currentproduct.setProductType(productTypeRepository.findById(updatedproduct.productTypeId()).orElse(null));

        applyRelationshipsFromUpdateDto(currentproduct, updatedproduct);

        List<ProductVariant> updatedVariants = new ArrayList<>();

        if (updatedproduct.variants() != null) {
            for (ResponseVariantDTO vDto : updatedproduct.variants()) {
                ProductVariant variant = null;

                if (vDto.id() != null) {
                    variant = existingById.remove(vDto.id());
                }

                if (variant == null && vDto.sku() != null && !vDto.sku().isBlank()) {
                    variant = existingBySku.get(vDto.sku());
                    if (variant != null) {
                        if (variant.getId() != null) existingById.remove(variant.getId());
                        existingBySku.remove(vDto.sku());
                    }
                }

                if (variant == null) {
                    if (vDto.sku() != null && !vDto.sku().isBlank()) {
                        Optional<ProductVariant> other = productVariantRepository.findBySku(vDto.sku());
                        if (other.isPresent()) {
                            if (other.get().getProduct() == null || !other.get().getProduct().getId().equals(currentproduct.getId())) {
                                throw new ResourceAlreadyExistsException("SKU " + vDto.sku() + " is already used by another variant");
                            } else {
                                variant = other.get();
                            }
                        }
                    }
                }

                if (variant == null) {variant = new ProductVariant();}
                variant.setProduct(currentproduct);
                variant.setSku(vDto.sku());
                variant.setPrice(vDto.price());
                variant.setOldPrice(vDto.oldPrice());
                variant.setStock(vDto.stock());
                variant.setWeight(vDto.weight());

                variant.setDisplayName(buildDisplayName(currentproduct, variant));

                updatedVariants.add(variant);
            }
        }

        currentproduct.getProductVariants().clear();
        currentproduct.getProductVariants().addAll(updatedVariants);

        if (!existingById.isEmpty()) {
            for (ProductVariant toRemove : existingById.values()) {
                currentproduct.getProductVariants().remove(toRemove);
            }
        }

        if (!existingById.isEmpty()) {
            for (ProductVariant toRemove : existingById.values()) {
                currentproduct.getProductVariants().remove(toRemove);
            }
        }

        return productRepository.save(currentproduct);
    }

    @Transactional
    public Product create(CreateProductDTO createProductDTO, List<MultipartFile> files) throws IOException {
        if (createProductDTO == null) {
            throw new InvalidRequestException("Product is null");
        }
        Product product = new Product();
        product.setName(createProductDTO.name());
        product.setDescription(createProductDTO.description());
        product.setFeedingNote(createProductDTO.feedingNote());
        product.setGuaranteedIndicators(createProductDTO.guaranteedIndicators());
        product.setSlug(createProductDTO.slug());
        product.setIsActive(true);
        product.setIsFeatured(false);
        product.setBrand(brandRepository.findById(createProductDTO.brandId()).orElse(null));
        product.setProductType(productTypeRepository.findById(createProductDTO.productTypeId()).orElse(null));

        processProductRelationships(product, createProductDTO);
        setProductVariants(product, createProductDTO);
        Product saved = productRepository.save(product);

        productImagesService.addImagesToProduct(saved, files);

        return productRepository.save(saved);
    }

    @Transactional
    public void deleteById(long id) {
        if (!productRepository.findById(id).isPresent())
        {throw new InvalidRequestException("Product with id " + id + " does not exist");}
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductCardDTO> getProductCardsForFrontend(Boolean active) {
        List<Product> products = (active != null) ? findByIsActive(active) : findAll();
        return products.stream().map(this::toProductCardDTO).toList();
    }

    private void processProductRelationships(Product product, CreateProductDTO dto) {
        if (dto.breedIds() != null && !dto.breedIds().isEmpty()) {
            Set<Breed> breeds = new LinkedHashSet<>(breedRepository.findAllById(dto.breedIds()));
            product.setBreeds(breeds);
        }

        if (dto.categoryIds() != null && !dto.categoryIds().isEmpty()) {
            Set<Category> categories = new LinkedHashSet<>(categoryRepository.findAllById(dto.categoryIds()));
            product.setCategories(categories);
        }

        if (dto.countryIds() != null && !dto.countryIds().isEmpty()) {
            Set<Country> countries = new LinkedHashSet<>(countryRepository.findAllById(dto.countryIds()));
            product.setCountries(countries);
        }

        if (dto.typeoffoodIds() != null && !dto.typeoffoodIds().isEmpty()) {
            Set<Typeoffood> typeoffoods = new LinkedHashSet<>(typeoffoodRepository.findAllById(dto.typeoffoodIds()));
            product.setTypeoffoods(typeoffoods);
        }

        if (dto.flavorIds() != null && !dto.flavorIds().isEmpty()) {
            Set<Flavor> flavors = new LinkedHashSet<>(flavorRepository.findAllById(dto.flavorIds()));
            product.setFlavors(flavors);
        }
    }

    private void applyRelationshipsFromUpdateDto(Product product, UpdateProductDTO dto) {
        if (dto.breedIds() != null) {
            Set<Breed> breeds = new LinkedHashSet<>(breedRepository.findAllById(dto.breedIds()));
            product.setBreeds(breeds);
        }
        if (dto.categoryIds() != null) {
            Set<Category> categories = new LinkedHashSet<>(categoryRepository.findAllById(dto.categoryIds()));
            product.setCategories(categories);
        }
        if (dto.countryIds() != null) {
            Set<Country> countries = new LinkedHashSet<>(countryRepository.findAllById(dto.countryIds()));
            product.setCountries(countries);
        }
        if (dto.typeoffoodIds() != null) {
            Set<Typeoffood> typeoffoods = new LinkedHashSet<>(typeoffoodRepository.findAllById(dto.typeoffoodIds()));
            product.setTypeoffoods(typeoffoods);
        }
        if (dto.flavorIds() != null) {
            Set<Flavor> flavors = new LinkedHashSet<>(flavorRepository.findAllById(dto.flavorIds()));
            product.setFlavors(flavors);
        }
    }

    private void setProductVariants(Product product, CreateProductDTO dto) {
        List<ProductVariant> productVariants = new ArrayList<>();
        for (CreateVariantDTO v : dto.variants()){
            ProductVariant variant = new ProductVariant();
            variant.setProduct(product);
            variant.setSku(v.sku());
            variant.setPrice(v.price());
            variant.setStock(v.stock());
            variant.setWeight(v.weight());
            if (v.colorIds() != null && !v.colorIds().isEmpty()) {
                Set<Color> colors = new LinkedHashSet<>(colorRepository.findAllById(v.colorIds()));
                variant.setColors(colors);
            }

            if (v.scentIds() != null && !v.scentIds().isEmpty()) {
                Set<Scent> scents = new LinkedHashSet<>(scentRepository.findAllById(v.scentIds()));
                variant.setScents(scents);
            }

            variant.setDisplayName(buildDisplayName(product, variant));

            productVariants.add(variant);
        }
        product.setProductVariants(productVariants);
    }

    private List<String> splitFlavorAtoms(String raw) {
        if (raw == null) return List.of();
        String cleaned = raw.trim();
        String[] parts = cleaned.split(FLAVOR_SPLIT_REGEX);
        List<String> atoms = new ArrayList<>();
        for (String p : parts) {
            p = p.trim();
            if (!p.isEmpty()) atoms.add(p);
        }
        return atoms;
    }

    private String canonicalize(String s) {
        if (s == null) return null;
        return s.toLowerCase()
                .replaceAll("[^\\p{L}\\p{Nd}]+", " ") // оставить буквы и цифры
                .trim()
                .replaceAll("\\s+", " ");
    }

    private Flavor findOrCreateFlavorByName(String rawName) {
        String canonical = canonicalize(rawName);
        return flavorRepository.findByCanonicalName(canonical)
                .orElseGet(() -> {
                    Flavor f = new Flavor();
                    f.setName(rawName.trim());
                    f.setCanonicalName(canonical);
                    return flavorRepository.save(f);
                });
    }

    private String joinFlavorNames(ProductVariant variant, Product product) {
        List<String> names = new ArrayList<>();
        if (product.getFlavors() != null && !product.getFlavors().isEmpty()) {
            product.getFlavors().forEach(f -> names.add(f.getName()));
        }
        return names.isEmpty() ? null : String.join(" + ", names);
    }

    private String buildDisplayName(Product product, ProductVariant variant) {
        StringBuilder sb = new StringBuilder();

        if (product.getBrand() != null && product.getBrand().getName() != null) {
            sb.append(product.getBrand().getName()).append(" ");
        }

        if (product.getName() != null) {
            sb.append(product.getName());
        }

        String flavorPart = joinFlavorNames(variant, product);
        if (flavorPart != null && !flavorPart.isBlank()) {
            sb.append(", ").append(flavorPart);
        }

        return sb.toString().trim();
    }

    @Transactional(readOnly = true)
    public List<VariantCardDTO> filterProductCardsByParams(MultiValueMap<String, String> queryParams) {
        ProductFilter filter = FilterParser.parseFromParams(queryParams);
        Specification<ProductVariant> spec = ProductSpecificationBuilder.build(filter);

        List<ProductVariant> products;
        Sort sort = Sort.by(Sort.Direction.ASC, "id");
        if (spec == null) {
            products = productVariantRepository.findAll(sort);

            // можно убрать сорт или поменять
        } else {
            products = productVariantRepository.findAll(spec, sort);
        }

        return products.stream().map(this::toVariantCardDTO).toList();
    }

    @Transactional(readOnly = true)
    public Page<VariantCardDTO> filterProductCardsByUrl(String filtersUrl, Pageable pageable) {
        ProductFilter filter = FilterParser.parseFromUrlString(filtersUrl);
        Specification<ProductVariant> spec = ProductSpecificationBuilder.build(filter);

        Page<ProductVariant> page;
        if (spec == null) {
            page = productVariantRepository.findAll(pageable);
        } else {
            page = productVariantRepository.findAll(spec, pageable);
        }

        return page.map(this::toVariantCardDTO);
    }

    @Transactional(readOnly = true)
    public Page<VariantCardDTO> searchProductCardsByText(String query, Pageable pageable) {
        if (query == null || query.isBlank()) {
            return Page.empty(pageable);
        }

        // Нормализуем запрос: приводим к нижнему регистру и заменяем ё на е
        String normalizedQuery = query.trim().toLowerCase()
            .replace('ё', 'е')
            .replaceAll("\\s+", " ");

        // Расширяем запрос синонимами
        Set<String> searchTerms = expandSearchTerms(normalizedQuery);

        // Создаем спецификацию для поиска по displayName и весу
        Specification<ProductVariant> textSearchSpec = (root, criteriaQuery, cb) -> {
            if (criteriaQuery != null) {
                criteriaQuery.distinct(true);
            }
            
            // Ищем по displayName (регистронезависимый поиск)
            Expression<String> displayNameLower = cb.lower(root.get("displayName"));
            Expression<BigDecimal> weight = root.get("weight");
            
            // Создаем список условий OR для всех терминов поиска
            List<Predicate> predicates = new ArrayList<>();
            
            for (String term : searchTerms) {
                if (term.length() <= 1) continue; // Пропускаем слишком короткие термины
                
                String searchPattern = "%" + term + "%";
                
                // Добавляем вариант с ё (если в термине было е, а в БД ё)
                String searchPatternWithYo = "%" + term.replace('е', 'ё') + "%";
                
                // Поиск по displayName
                predicates.add(cb.like(displayNameLower, searchPattern));
                predicates.add(cb.like(displayNameLower, searchPatternWithYo));
                
                // Пытаемся найти число в термине для поиска по весу
                try {
                    // Убираем все нецифровые символы кроме точки и запятой
                    String numericString = term.replaceAll("[^0-9.,]", "").replace(',', '.');
                    if (!numericString.isEmpty()) {
                        BigDecimal weightValue = new BigDecimal(numericString);
                        // Ищем точное совпадение веса
                        predicates.add(cb.equal(weight, weightValue));
                    }
                } catch (NumberFormatException | ArithmeticException e) {
                    // Если не получилось распарсить как число, игнорируем
                }
            }
            
            // Также проверяем исходный запрос на наличие числа
            try {
                String numericString = normalizedQuery.replaceAll("[^0-9.,]", "").replace(',', '.');
                if (!numericString.isEmpty()) {
                    BigDecimal weightValue = new BigDecimal(numericString);
                    predicates.add(cb.equal(weight, weightValue));
                }
            } catch (NumberFormatException | ArithmeticException e) {
                // Если не получилось распарсить как число, игнорируем
            }
            
            // Если нет условий, возвращаем условие, которое никогда не сработает
            if (predicates.isEmpty()) {
                return cb.disjunction();
            }
            
            // Объединяем все условия через OR
            return cb.or(predicates.toArray(new Predicate[0]));
        };

        // Добавляем фильтр по активности продукта и варианта
        Specification<ProductVariant> activeSpec = (root, criteriaQuery, cb) -> {
            if (criteriaQuery != null) {
                criteriaQuery.distinct(true);
            }
            Join<ProductVariant, Product> product = root.join("product");
            return cb.and(
                cb.or(
                    cb.isNull(product.get("isActive")),
                    cb.isTrue(product.get("isActive"))
                ),
                cb.or(
                    cb.isNull(root.get("isActive")),
                    cb.isTrue(root.get("isActive"))
                )
            );
        };

        // Объединяем спецификации
        Specification<ProductVariant> finalSpec = Specification.where(textSearchSpec).and(activeSpec);

        // Получаем результаты без пагинации для сортировки по релевантности
        List<ProductVariant> allResults = productVariantRepository.findAll(finalSpec);
        
        // Вычисляем релевантность и сортируем
        List<ProductVariant> sortedResults = allResults.stream()
            .map(variant -> {
                // Вычисляем релевантность
                double relevance = calculateRelevance(variant, normalizedQuery, searchTerms);
                return new RelevanceWrapper(variant, relevance);
            })
            .sorted((a, b) -> Double.compare(b.relevance, a.relevance)) // Сортируем по убыванию релевантности
            .map(wrapper -> wrapper.variant)
            .collect(java.util.stream.Collectors.toList());
        
        // Применяем пагинацию вручную
        int pageNumber = pageable.getPageNumber();
        int pageSize = pageable.getPageSize();
        int start = pageNumber * pageSize;
        int end = Math.min(start + pageSize, sortedResults.size());
        
        List<ProductVariant> pagedResults = start < sortedResults.size() 
            ? sortedResults.subList(start, end)
            : new ArrayList<>();
        
        return new PageImpl<>(
            pagedResults.stream().map(this::toVariantCardDTO).collect(java.util.stream.Collectors.toList()),
            pageable,
            sortedResults.size()
        );
    }
    
    // Вспомогательный класс для сортировки по релевантности
    private static class RelevanceWrapper {
        ProductVariant variant;
        double relevance;
        
        RelevanceWrapper(ProductVariant variant, double relevance) {
            this.variant = variant;
            this.relevance = relevance;
        }
    }
    
    // Вычисление релевантности товара к запросу
    private double calculateRelevance(ProductVariant variant, String query, Set<String> searchTerms) {
        String displayName = variant.getDisplayName();
        if (displayName == null) return 0.0;
        
        String normalizedDisplayName = displayName.toLowerCase()
            .replace('ё', 'е')
            .replaceAll("\\s+", " ");
        
        double score = 0.0;
        String[] queryWords = query.split("\\s+");
        String[] displayWords = normalizedDisplayName.split("\\s+");
        
        // 1. Точное совпадение всего запроса (максимальный балл)
        if (normalizedDisplayName.equals(query)) {
            score += 1000.0;
        } else if (normalizedDisplayName.startsWith(query)) {
            score += 500.0; // Запрос в начале названия
        } else if (normalizedDisplayName.contains(query)) {
            score += 100.0; // Запрос содержится в названии
        }
        
        // 2. Количество совпадающих слов из запроса
        int matchingWords = 0;
        for (String queryWord : queryWords) {
            if (queryWord.length() > 1) {
                for (String displayWord : displayWords) {
                    if (displayWord.equals(queryWord)) {
                        matchingWords++;
                        score += 50.0; // Точное совпадение слова
                        break;
                    } else if (displayWord.contains(queryWord) || queryWord.contains(displayWord)) {
                        matchingWords++;
                        score += 10.0; // Частичное совпадение слова
                        break;
                    }
                }
            }
        }
        
        // 3. Бонус за совпадение с исходными терминами запроса (не синонимами)
        for (String queryWord : queryWords) {
            if (queryWord.length() > 1 && normalizedDisplayName.contains(queryWord)) {
                score += 20.0; // Дополнительный балл за исходные слова запроса
            }
        }
        
        // 4. Штраф за длину - короткие названия с совпадением лучше
        if (score > 0) {
            double lengthPenalty = Math.min(displayName.length() / 100.0, 10.0);
            score = score / (1.0 + lengthPenalty * 0.1);
        }
        
        return score;
    }

    private ProductCardDTO toProductCardDTO(Product product) {
        List<VariantCardDTO> variantCards = product.getProductVariants().stream()
                .sorted(Comparator.comparing(ProductVariant::getId))
                .map(this::toVariantCardDTO).toList();

        return new ProductCardDTO(product.getId(), product.getName(), product.getIsActive(), variantCards);
    }

//    private ProductCardDTO toProductCardDTO(Product product) {
//        List<ProductImage> images = product.getImages() == null ? List.of() : new ArrayList<>(product.getImages());
//
//        Optional<ProductImage> mainImageOpt = product.getImages().stream()
//                .filter(img -> img.getProductVariant() == null && img.getIsMain())
//                .findFirst();
//
//        Long productMainId = mainImageOpt.map(ProductImage::getId)
//                .orElse(null);
//
//        String productMainUrl = productMainId == null ? null : "/api/products/" + product.getId() + "/images/" + productMainId;
//
//        List<VariantCardDTO> variantCards = product.getProductVariants().stream()
//                .sorted(Comparator.comparing(ProductVariant::getId))
//                .map(v -> {
//                    Optional<ProductImage> variantImageOpt = images.stream()
//                            .filter(img -> img.getProductVariant() != null &&
//                                    img.getProductVariant().getId().equals(v.getId()))
//                            .findFirst();
//                    Long imageId;
//                    if (variantImageOpt.isPresent()) {
//                        imageId = variantImageOpt.get().getId();
//                    } else {
//                        imageId = productMainId;
//                    }
//
//                    String imageUrl = imageId == null ? null :
//                            "/api/products/" + product.getId() + "/images/" + imageId;
//
//                    return new VariantCardDTO(
//                    v.getId(),
//                    v.getDisplayName() != null && !v.getDisplayName().isBlank()
//                            ? v.getDisplayName()
//                            : (product.getName() + (v.getWeight() != null ? (", " + v.getWeight() + " кг") : "")),
//                    v.getPrice(),
//                    v.getStock(),
//                    v.getWeight(),
//                    imageUrl
//            );
//        }).toList();
//
//        return new ProductCardDTO(product.getId(), product.getName(), variantCards);
//    }

    public VariantCardDTO toVariantCardDTO(ProductVariant v) {
        Product product = v.getProduct();
        
        // Оптимизация: используем уже загруженные изображения из EntityGraph
        // и ищем нужное изображение более эффективно
        Long imageId = null;
        
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            // Сначала ищем изображение для варианта (более специфичное)
            for (ProductImage img : product.getImages()) {
                if (img.getProductVariant() != null && img.getProductVariant().getId().equals(v.getId())) {
                    imageId = img.getId();
                    break; // Нашли - выходим
                }
            }
            
            // Если не нашли изображение для варианта, ищем главное изображение продукта
            if (imageId == null) {
                for (ProductImage img : product.getImages()) {
                    if (img.getProductVariant() == null && Boolean.TRUE.equals(img.getIsMain())) {
                        imageId = img.getId();
                        break; // Нашли - выходим
                    }
                }
            }
        }
        
        String imageUrl = imageId == null ? null :
                "/api/products/" + product.getId() + "/images/" + imageId;

        return new VariantCardDTO(
                v.getId(),
                v.getDisplayName() != null && !v.getDisplayName().isBlank()
                        ? v.getDisplayName()
                        : (product.getName() + (v.getWeight() != null ? (", " + v.getWeight() + " кг") : "")),
                v.getPrice(),
                v.getStock(),
                v.getWeight(),
                imageUrl
        );
    }
}
