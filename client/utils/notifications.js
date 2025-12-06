// Утилита для работы с уведомлениями на телефоне
import { safeError, safeWarn } from "./logger";

// Запрос разрешения на уведомления
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    safeWarn("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Показать уведомление
export function showNotification(title, options = {}) {
  if (!("Notification" in window)) {
    safeWarn("This browser does not support notifications");
    return null;
  }

  if (Notification.permission === "granted") {
    try {
      // Используем логотип как иконку, если он доступен
      const notificationOptions = {
        requireInteraction: false,
        ...options,
      };
      
      // Добавляем иконку только если она не указана в options
      if (!notificationOptions.icon) {
        // Пробуем использовать логотип, если он есть
        notificationOptions.icon = "/logo.svg";
      }
      
      const notification = new Notification(title, notificationOptions);

      // Закрыть уведомление через 5 секунд
      setTimeout(() => {
        notification.close();
      }, 5000);

      // При клике на уведомление открыть соответствующую страницу
      notification.onclick = () => {
        window.focus();
        if (options.url) {
          window.location.href = options.url;
        }
        notification.close();
      };

      // Обработка ошибок уведомления
      notification.onerror = (error) => {
        safeError("Ошибка уведомления:", error);
      };

      return notification;
    } catch (error) {
      safeError("Ошибка при создании уведомления:", error);
      return null;
    }
  } else if (Notification.permission === "denied") {
    safeWarn("Notification permission denied");
    return null;
  } else {
    safeWarn("Notification permission not granted yet");
    return null;
  }
}

// Тестовая функция для проверки уведомлений
export async function testNotification() {
  // Проверяем поддержку уведомлений
  if (!("Notification" in window)) {
    alert("Ваш браузер не поддерживает уведомления. Пожалуйста, используйте современный браузер (Chrome, Firefox, Safari, Edge).");
    return false;
  }

  // Проверяем текущий статус разрешения
  let permission = Notification.permission;
  
  if (permission === "denied") {
    alert("Разрешение на уведомления было отклонено. Пожалуйста, разрешите уведомления в настройках браузера:\n\nChrome/Edge: Настройки → Конфиденциальность → Уведомления\nSafari: Настройки → [Сайт] → Уведомления\nFirefox: Настройки → Конфиденциальность → Уведомления");
    return false;
  }

  // Запрашиваем разрешение, если его еще нет
  if (permission !== "granted") {
    permission = await Notification.requestPermission();
  }

  if (permission === "granted") {
    try {
      const notification = showNotification("Тестовое уведомление", {
        body: "Если вы видите это уведомление, система работает корректно!",
        tag: "test-notification",
        url: "/admin",
      });

      if (notification) {
        // Показываем дополнительное сообщение в консоли
        setTimeout(() => {
        }, 100);
        return true;
      } else {
        alert("Не удалось создать уведомление. Проверьте консоль браузера для подробностей.");
        return false;
      }
    } catch (error) {
      safeError("Ошибка при создании уведомления:", error);
      alert(`Ошибка при создании уведомления: ${error.message}\n\nПроверьте консоль браузера для подробностей.`);
      return false;
    }
  } else {
    alert("Разрешение на уведомления не предоставлено. Пожалуйста, разрешите уведомления в настройках браузера.");
    return false;
  }
}

// Проверка новых заказов
export async function checkNewOrders(adminToken, lastOrderDate = null) {
  try {
    const res = await fetch("/api/orders", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (res.ok) {
      const orders = await res.json();
      const ordersList = Array.isArray(orders) ? orders : [];

      if (ordersList.length > 0) {
        // Находим самый новый заказ
        const newestOrder = ordersList.reduce((newest, order) => {
          const orderDate = new Date(order.createdAt || 0);
          const newestDate = new Date(newest.createdAt || 0);
          return orderDate > newestDate ? order : newest;
        });

        const newestOrderDate = new Date(newestOrder.createdAt || 0);

        // Если это новый заказ (дата создания больше последней известной)
        if (lastOrderDate === null || newestOrderDate > lastOrderDate) {
          const orderAmount = newestOrder.totalAmount 
            ? `${newestOrder.totalAmount.toLocaleString("ru-RU")} ₽`
            : "сумма не указана";

          showNotification("Новый заказ!", {
            body: `Заказ №${newestOrder.id} на сумму ${orderAmount}`,
            tag: `order-${newestOrder.id}`,
            url: "/admin/orders",
          });

          return newestOrderDate;
        }
      }
    }
  } catch (e) {
    safeError("Error checking new orders:", e);
  }

  return lastOrderDate;
}

// Проверка новых анкет
export async function checkNewForms(adminToken, lastFeedbackDate = null, lastNurseryDate = null) {
  try {
    const [feedbackRes, nurseryRes] = await Promise.all([
      fetch("/api/forms/feedbackform", {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      fetch("/api/forms/nurseryform", {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
    ]);

    let newLastFeedbackDate = lastFeedbackDate;
    let newLastNurseryDate = lastNurseryDate;

    if (feedbackRes.ok) {
      const feedbackForms = await feedbackRes.json();
      const formsList = Array.isArray(feedbackForms) ? feedbackForms : [];

      if (formsList.length > 0) {
        const newestForm = formsList.reduce((newest, form) => {
          const formDate = new Date(form.createdAt || form.created_at || 0);
          const newestDate = new Date(newest.createdAt || newest.created_at || 0);
          return formDate > newestDate ? form : newest;
        });

        const newestFormDate = new Date(newestForm.createdAt || newestForm.created_at || 0);

        if (lastFeedbackDate === null || newestFormDate > lastFeedbackDate) {
          showNotification("Новая анкета обратной связи!", {
            body: `Получена новая анкета обратной связи`,
            tag: `feedback-${newestForm.id}`,
            url: "/admin/forms",
          });
          newLastFeedbackDate = newestFormDate;
        }
      }
    }

    if (nurseryRes.ok) {
      const nurseryForms = await nurseryRes.json();
      const formsList = Array.isArray(nurseryForms) ? nurseryForms : [];

      if (formsList.length > 0) {
        const newestForm = formsList.reduce((newest, form) => {
          const formDate = new Date(form.createdAt || form.created_at || 0);
          const newestDate = new Date(newest.createdAt || newest.created_at || 0);
          return formDate > newestDate ? form : newest;
        });

        const newestFormDate = new Date(newestForm.createdAt || newestForm.created_at || 0);

        if (lastNurseryDate === null || newestFormDate > lastNurseryDate) {
          showNotification("Новая анкета питомника!", {
            body: `Получена новая анкета питомника`,
            tag: `nursery-${newestForm.id}`,
            url: "/admin/forms",
          });
          newLastNurseryDate = newestFormDate;
        }
      }
    }

    return { lastFeedbackDate: newLastFeedbackDate, lastNurseryDate: newLastNurseryDate };
  } catch (e) {
    safeError("Error checking new forms:", e);
  }

  return { lastFeedbackDate, lastNurseryDate };
}

// Инициализация системы уведомлений
export async function initNotifications(adminToken, isStaff, isSuperUser) {
  // Проверяем права доступа
  if (!isStaff && !isSuperUser) {
    return null;
  }

  // Запрашиваем разрешение
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) {
    return null;
  }

  // Сохраняем даты последних заказов и анкет (инициализируем текущими значениями без показа уведомлений)
  let lastOrderDate = null;
  let lastFeedbackDate = null;
  let lastNurseryDate = null;

  // Функция для инициализации - загружаем текущие значения без показа уведомлений
  const initializeLastDates = async () => {
    try {
      // Загружаем текущие заказы и анкеты для инициализации
      const [ordersRes, feedbackRes, nurseryRes] = await Promise.all([
        fetch("/api/orders", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/forms/feedbackform", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
        fetch("/api/forms/nurseryform", {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      ]);

      // Инициализируем дату последнего заказа
      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const ordersList = Array.isArray(orders) ? orders : [];
        if (ordersList.length > 0) {
          const newestOrder = ordersList.reduce((newest, order) => {
            const orderDate = new Date(order.createdAt || 0);
            const newestDate = new Date(newest.createdAt || 0);
            return orderDate > newestDate ? order : newest;
          });
          lastOrderDate = new Date(newestOrder.createdAt || 0);
        }
      }

      // Инициализируем дату последней анкеты обратной связи
      if (feedbackRes.ok) {
        const feedbackForms = await feedbackRes.json();
        const formsList = Array.isArray(feedbackForms) ? feedbackForms : [];
        if (formsList.length > 0) {
          const newestForm = formsList.reduce((newest, form) => {
            const formDate = new Date(form.createdAt || form.created_at || 0);
            const newestDate = new Date(newest.createdAt || newest.created_at || 0);
            return formDate > newestDate ? form : newest;
          });
          lastFeedbackDate = new Date(newestForm.createdAt || newestForm.created_at || 0);
        }
      }

      // Инициализируем дату последней анкеты питомника
      if (nurseryRes.ok) {
        const nurseryForms = await nurseryRes.json();
        const formsList = Array.isArray(nurseryForms) ? nurseryForms : [];
        if (formsList.length > 0) {
          const newestForm = formsList.reduce((newest, form) => {
            const formDate = new Date(form.createdAt || form.created_at || 0);
            const newestDate = new Date(newest.createdAt || newest.created_at || 0);
            return formDate > newestDate ? form : newest;
          });
          lastNurseryDate = new Date(newestForm.createdAt || newestForm.created_at || 0);
        }
      }
    } catch (e) {
      safeError("Error initializing notification dates:", e);
    }
  };

  // Инициализируем даты без показа уведомлений
  await initializeLastDates();

  // Функция проверки новых элементов
  const checkNotifications = async () => {
    // Проверяем только если страница не видна (в фоне)
    if (document.hidden) {
      const newLastOrderDate = await checkNewOrders(adminToken, lastOrderDate);
      if (newLastOrderDate !== lastOrderDate) {
        lastOrderDate = newLastOrderDate;
      }

      const formsResult = await checkNewForms(adminToken, lastFeedbackDate, lastNurseryDate);
      if (formsResult.lastFeedbackDate !== lastFeedbackDate) {
        lastFeedbackDate = formsResult.lastFeedbackDate;
      }
      if (formsResult.lastNurseryDate !== lastNurseryDate) {
        lastNurseryDate = formsResult.lastNurseryDate;
      }
    }
  };

  // Проверяем каждые 30 секунд только когда страница в фоне
  const intervalId = setInterval(() => {
    if (document.hidden) {
      checkNotifications();
    }
  }, 30000);

  // Возвращаем функцию для очистки
  return () => {
    clearInterval(intervalId);
  };
}

