package com.example.backend.Infrastructure.Services;

import com.example.backend.Domain.Models.OrderItem;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.from}")
    private String fromEmail;
    
    @Value("${spring.mail.to}")
    private String toEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Отправка email уведомления о новой форме сотрудничества
     */
    public void sendCooperationFormEmail(String name, String phone, String email, String city, String comment) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Новая заявка на сотрудничество - Landor Shop");
            
            StringBuilder body = new StringBuilder();
            body.append("Поступила новая заявка на сотрудничество:\n\n");
            body.append("Имя: ").append(name).append("\n");
            body.append("Телефон: ").append(phone).append("\n");
            body.append("Email: ").append(email).append("\n");
            body.append("Город: ").append(city).append("\n");
            if (comment != null && !comment.trim().isEmpty()) {
                body.append("Комментарий: ").append(comment).append("\n");
            }
            
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем выполнение
            System.err.println("Ошибка отправки email о форме сотрудничества: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Отправка email уведомления о новой форме заводчиков
     */
    public void sendBreedersFormEmail(String organizationName, String fullName, String city, 
                                       String email, String phone, String fileName) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Новая заявка от заводчика - Landor Shop");
            
            StringBuilder body = new StringBuilder();
            body.append("Поступила новая заявка от заводчика:\n\n");
            body.append("Название питомника: ").append(organizationName).append("\n");
            body.append("ФИО: ").append(fullName).append("\n");
            body.append("Город: ").append(city).append("\n");
            body.append("Email: ").append(email).append("\n");
            body.append("Телефон: ").append(phone).append("\n");
            if (fileName != null && !fileName.trim().isEmpty()) {
                body.append("Прикреплен файл: ").append(fileName).append("\n");
                body.append("(Файл доступен в админ-панели)\n");
            }
            
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем выполнение
            System.err.println("Ошибка отправки email о форме заводчиков: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Отправка email уведомления о новом заказе
     */
    public void sendOrderEmail(Long orderId, String customerName, String customerEmail, 
                               String customerPhone, String totalAmount, String paymentMethod, 
                               String deliveryMethod, String customerNotes, List<OrderItem> orderItems) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Новый заказ #" + orderId + " - Landor Shop");
            
            StringBuilder body = new StringBuilder();
            body.append("Поступил новый заказ:\n\n");
            body.append("Номер заказа: #").append(orderId).append("\n");
            body.append("Имя клиента: ").append(customerName).append("\n");
            body.append("Email: ").append(customerEmail).append("\n");
            body.append("Телефон: ").append(customerPhone).append("\n");
            body.append("Сумма заказа: ").append(totalAmount).append("\n");
            body.append("Способ оплаты: ").append(paymentMethod).append("\n");
            body.append("Способ доставки: ").append(deliveryMethod).append("\n");
            if (customerNotes != null && !customerNotes.trim().isEmpty()) {
                body.append("Комментарий клиента: ").append(customerNotes).append("\n");
            }
            
            // Добавляем список товаров
            if (orderItems != null && !orderItems.isEmpty()) {
                body.append("\n--- Товары в заказе ---\n");
                int itemNumber = 1;
                for (OrderItem item : orderItems) {
                    body.append("\n").append(itemNumber).append(". ");
                    body.append(item.getProductName() != null ? item.getProductName() : "Товар");
                    body.append("\n   Количество: ").append(item.getQuantity());
                    body.append("\n   Цена за единицу: ").append(item.getPrice() != null ? item.getPrice().toString() : "0").append(" руб.");
                    body.append("\n   Сумма: ").append(item.getTotalPrice() != null ? item.getTotalPrice().toString() : "0").append(" руб.");
                    if (item.getWeight() != null) {
                        body.append("\n   Вес: ").append(item.getWeight().toString()).append(" кг");
                    }
                    if (item.getSku() != null && !item.getSku().trim().isEmpty()) {
                        body.append("\n   Артикул: ").append(item.getSku());
                    }
                    itemNumber++;
                }
            }
            
            body.append("\n\nПодробности заказа доступны в админ-панели.\n");
            
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception e) {
            // Логируем ошибку, но не прерываем выполнение
            System.err.println("Ошибка отправки email о заказе: " + e.getMessage());
            e.printStackTrace();
        }
    }
}

