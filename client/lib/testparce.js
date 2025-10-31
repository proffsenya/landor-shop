const mockProduct = {
  id: 1,
  name: "LANDOR полнорационный сухой корм для взрослых собак всех пород",
  images: ["/korm1.svg", "/korm1.svg", "/korm1.svg", "/korm1.svg"],
  producers: [
    {
      name: "LANDOR Россия",
      weightOptions: [
        { weight: "1 кг", price: 2000, available: true },
        { weight: "3 кг", price: 3000, available: true },
      ],
    },
    {
      name: "LANDOR Испания",
      weightOptions: [{ weight: "2 кг", price: 2500, available: true }],
    },
  ],
  country: "Россия / Испания",
  tastes: ["Индейка", "Лосось"],
  animalType: "Котёнок",
  size: "Все породы",
  age: "Котята",
  nutritionalValue:
    "422 ккал/100 г. Хранить в сухом прохладном месте при комнатной температуре и относительной влажности воздуха не более 75 %.",
  guaranteedIndicators:
    "Сырой протеин 34 %, жир 19 %, клетчатка 2,3 %, зола 8 %, углеводы 28,7 %, влага 8 %.",
  feedingNote:
    "Количество корма зависит от сезона, активности и индивидуальных особенностей животного. Вводить постепенно 5–10 дней. Всегда должна быть свежая вода.",
};

const parsedProducts = mockProduct.producers.flatMap((producer) =>
  producer.weightOptions.map((option) => ({
    id: `${mockProduct.id}-${producer.name}-${option.weight}`,
    name: mockProduct.name,
    producer: producer.name,
    country: producer.name.includes("Россия") ? "Россия" : "Испания",
    weight: option.weight,
    price: option.price,
    available: option.available,
    images: mockProduct.images,
    tastes: mockProduct.tastes,
    animalType: mockProduct.animalType,
    size: mockProduct.size,
    age: mockProduct.age,
    nutritionalValue: mockProduct.nutritionalValue,
    guaranteedIndicators: mockProduct.guaranteedIndicators,
    feedingNote: mockProduct.feedingNote,
  }))
);

console.log(parsedProducts);
