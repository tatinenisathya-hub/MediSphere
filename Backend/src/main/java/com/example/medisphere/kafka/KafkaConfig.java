package com.example.medisphere.kafka;

import java.util.HashMap;
import java.util.Map;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;

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

    private static final String BOOTSTRAP_SERVERS =
            "localhost:9092";

    // =========================================================
    // KAFKA TOPIC
    // =========================================================

    @Bean
    public NewTopic wearableVitalsTopic() {
        return TopicBuilder
                .name(WEARABLE_VITALS_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }

    // =========================================================
    // KAFKA CONSUMER
    // =========================================================

    @Bean
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

        return new DefaultKafkaConsumerFactory<>(
                props,
                new StringDeserializer(),
                jsonDeserializer
        );
    }

    // =========================================================
    // KAFKA LISTENER CONTAINER
    // =========================================================

    @Bean(name = "kafkaListenerContainerFactory")
    public ConcurrentKafkaListenerContainerFactory<
            String,
            WearableVitalEvent>
            kafkaListenerContainerFactory(
                    ConsumerFactory<String, WearableVitalEvent>
                            consumerFactory) {

        ConcurrentKafkaListenerContainerFactory<
                String,
                WearableVitalEvent> factory =
                new ConcurrentKafkaListenerContainerFactory<>();

        factory.setConsumerFactory(
                consumerFactory
        );

        return factory;
    }

    // =========================================================
    // KAFKA PRODUCER
    // =========================================================

    @Bean
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

        return new DefaultKafkaProducerFactory<>(
                props
        );
    }

    // =========================================================
    // KAFKA TEMPLATE
    // =========================================================

    @Bean
    public KafkaTemplate<String, WearableVitalEvent>
            wearableKafkaTemplate(
                    ProducerFactory<String, WearableVitalEvent>
                            producerFactory) {

        return new KafkaTemplate<>(
                producerFactory
        );
    }
}