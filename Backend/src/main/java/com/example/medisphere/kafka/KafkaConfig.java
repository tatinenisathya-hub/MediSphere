
package com.example.medisphere.kafka;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;

import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

@Configuration
@EnableKafka
public class KafkaConfig {

    public static final String WEARABLE_VITALS_TOPIC =
            "wearable-vitals";

    public static final String WEARABLE_VITALS_GROUP =
            "medisphere-wearable-consumer";

    public static final String DOCTOR_NOTIFICATIONS_TOPIC =
            "doctor-notifications";

    private static final String BOOTSTRAP_SERVERS =
            "localhost:9092";


    // ==========================================
    // KAFKA TOPICS
    // ==========================================

    @Bean
    public NewTopic wearableVitalsTopic() {

        return TopicBuilder
                .name(WEARABLE_VITALS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }


    @Bean
    public NewTopic doctorNotificationsTopic() {

        return TopicBuilder
                .name(DOCTOR_NOTIFICATIONS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }


    // ==========================================
    // WEARABLE VITALS CONSUMER FACTORY
    // ==========================================

    @Bean(name = "wearableConsumerFactory")
    public ConsumerFactory<String, WearableVitalEvent>
    wearableConsumerFactory() {

        Map<String, Object> props = new HashMap<>();

        props.put(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
                BOOTSTRAP_SERVERS
        );

        props.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                WEARABLE_VITALS_GROUP
        );

        props.put(
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
                "earliest"
        );

        props.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        JsonDeserializer<WearableVitalEvent>
                jsonDeserializer =
                new JsonDeserializer<>(
                        WearableVitalEvent.class
                );

      jsonDeserializer.addTrustedPackages(
        "com.example.medisphere.kafka"
);

// Ignore Kafka type headers
jsonDeserializer.setUseTypeHeaders(false);

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                jsonDeserializer
        );
    }


    // ==========================================
    // WEARABLE VITALS LISTENER FACTORY
    // ==========================================

    @Bean(name = "kafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory
    <String, WearableVitalEvent>
    kafkaListenerContainerFactory(
            @Qualifier("wearableConsumerFactory")
            ConsumerFactory<String, WearableVitalEvent>
                    consumerFactory
    ) {

        ConcurrentKafkaListenerContainerFactory
                <String, WearableVitalEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory);

        return factory;
    }


    // ==========================================
    // DOCTOR NOTIFICATION CONSUMER FACTORY
    // ==========================================

    @Bean(name = "doctorNotificationConsumerFactory")
    public ConsumerFactory<String, DoctorNotificationEvent>
    doctorNotificationConsumerFactory() {

        Map<String, Object> props = new HashMap<>();

        props.put(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG,
                BOOTSTRAP_SERVERS
        );

        props.put(
                ConsumerConfig.GROUP_ID_CONFIG,
                "doctor-notification-group"
        );

        props.put(
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG,
                "earliest"
        );

        props.put(
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG,
                StringDeserializer.class
        );

        /*
         * Explicitly deserialize messages as
         * DoctorNotificationEvent.
         *
         * This prevents the wearable event class
         * from being used for doctor notifications.
         */

        JsonDeserializer<DoctorNotificationEvent>
                jsonDeserializer =
                new JsonDeserializer<>(
                        DoctorNotificationEvent.class
                );

        jsonDeserializer.addTrustedPackages(
                "com.example.medisphere.kafka"
        );

        /*
         * Ignore producer type headers because the
         * target class is already specified above.
         */

        jsonDeserializer.setUseTypeHeaders(false);

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                jsonDeserializer
        );
    }


    // ==========================================
    // DOCTOR NOTIFICATION LISTENER FACTORY
    // ==========================================

    @Bean(name = "doctorKafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory
    <String, DoctorNotificationEvent>
    doctorKafkaListenerContainerFactory(
            @Qualifier("doctorNotificationConsumerFactory")
            ConsumerFactory<String, DoctorNotificationEvent>
                    consumerFactory
    ) {

        ConcurrentKafkaListenerContainerFactory
                <String, DoctorNotificationEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(consumerFactory);

        return factory;
    }


    // ==========================================
    // WEARABLE VITALS PRODUCER FACTORY
    // ==========================================

    @Bean(name = "wearableProducerFactory")
    public ProducerFactory<String, WearableVitalEvent>
    wearableProducerFactory() {

        Map<String, Object> props = new HashMap<>();

        props.put(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                BOOTSTRAP_SERVERS
        );

        props.put(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        props.put(
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                JsonSerializer.class
        );

        return new DefaultKafkaProducerFactory<>(props);
    }


    // ==========================================
    // WEARABLE VITALS KAFKA TEMPLATE
    // ==========================================

    @Bean(name = "wearableKafkaTemplate")
    public KafkaTemplate<String, WearableVitalEvent>
    wearableKafkaTemplate(
            @Qualifier("wearableProducerFactory")
            ProducerFactory<String, WearableVitalEvent>
                    producerFactory
    ) {

        return new KafkaTemplate<>(producerFactory);
    }


    // ==========================================
    // DOCTOR NOTIFICATION PRODUCER FACTORY
    // ==========================================

    @Bean(name = "doctorNotificationProducerFactory")
    public ProducerFactory<String, DoctorNotificationEvent>
    doctorNotificationProducerFactory() {

        Map<String, Object> props = new HashMap<>();

        props.put(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG,
                BOOTSTRAP_SERVERS
        );

        props.put(
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG,
                StringSerializer.class
        );

        props.put(
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG,
                JsonSerializer.class
        );

        return new DefaultKafkaProducerFactory<>(props);
    }


    // ==========================================
    // DOCTOR NOTIFICATION KAFKA TEMPLATE
    // ==========================================

    @Bean(name = "doctorNotificationKafkaTemplate")
    public KafkaTemplate<String, DoctorNotificationEvent>
    doctorNotificationKafkaTemplate(
            @Qualifier("doctorNotificationProducerFactory")
            ProducerFactory<String, DoctorNotificationEvent>
                    producerFactory
    ) {

        return new KafkaTemplate<>(producerFactory);
    }

}