# orders_app/services/kafka_producer.py
from kafka import KafkaProducer
import json
import logging

logger = logging.getLogger(__name__)

# Configuración del productor
def get_kafka_producer():
    """
    Crea y retorna una instancia singleton de KafkaProducer.
    Se usa JSON como formato de mensaje.
    """
    try:
        producer = KafkaProducer(
            bootstrap_servers=["localhost:9092"],
            value_serializer=lambda v: json.dumps(v).encode("utf-8")
        )
        return producer
    except Exception as e:
        logger.error(f"Error creating Kafka producer: {e}")
        raise


def publish_order_created_event(order):
    """
    Publica un evento 'order_created' en el tópico de Kafka.
    """
    try:
        producer = get_kafka_producer()
        topic = "order_created"

        event = {
            "orderId": str(order.id),
            "description": order.description,
            "amount": float(order.amount),
            "status": order.status,
        }

        print(f"📤 Intentando publicar evento en Kafka: {event}")  # 👈 diagnóstico

        producer.send(topic, value=event)
        producer.flush()

        print("✅ Evento publicado correctamente en Kafka")  # 👈 diagnóstico

        logger.info(f"✅ Order event published to Kafka: {event}")

    except Exception as e:
        print(f"❌ Error publicando evento: {e}")  # 👈 diagnóstico
        logger.error(f"❌ Error publishing order_created event: {e}")
