import os
import pika
import json
import time
import threading
from app.services import gemini_service

def start_consumer():
    rabbitmq_url = os.getenv("RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/")
    print(f"Connecting to RabbitMQ at: {rabbitmq_url}")
    
    # Retry connection in case RabbitMQ is still starting up
    connection = None
    retries = 10
    while retries > 0:
        try:
            parameters = pika.URLParameters(rabbitmq_url)
            connection = pika.BlockingConnection(parameters)
            break
        except Exception as e:
            print(f"RabbitMQ connection failed ({e}). Retrying in 5 seconds...")
            time.sleep(5)
            retries -= 1

    if not connection:
        print("Error: Could not connect to RabbitMQ broker after several retries.")
        return

    channel = connection.channel()
    
    # Declare the queue we listen to (must match NestJS ClientProxy configuration)
    channel.queue_declare(queue='portfolio_ml_queue', durable=False)
    
    # Declare the queue we publish back to
    channel.queue_declare(queue='portfolio_backend_queue', durable=False)

    def callback(ch, method, properties, body):
        try:
            message = json.loads(body.decode())
            print(f"[ML Consumer] Received message: {message}")
            
            # NestJS ClientProxy wraps data in {"pattern": "portfolio_updated", "data": {...}}
            pattern = message.get("pattern")
            data = message.get("data", {})
            
            if pattern == "portfolio_updated":
                portfolio_id = data.get("portfolioId")
                user_id = data.get("userId")
                industry = data.get("industry", "Software Development")
                skills = data.get("skills", [])
                description = data.get("description", "")

                print(f"[ML Consumer] Processing portfolio: {portfolio_id}")
                
                # 1. Generate design recommendations (font, templates, colors)
                recommendations = gemini_service.recommend_theme(industry, skills)
                
                # 2. Rephrase descriptions if user provided it
                enhanced_description = ""
                if description and len(description.strip()) > 5:
                    enhanced_description = gemini_service.enhance_text(description)
                
                # Construct response payload in NestJS client pattern format
                response_payload = {
                    "pattern": "ml_analysis_completed",
                    "data": {
                        "portfolioId": portfolio_id,
                        "userId": user_id,
                        "recommendations": recommendations,
                        "enhancedDescription": enhanced_description
                    }
                }
                
                # Publish event back to NestJS backend queue
                channel.basic_publish(
                    exchange='',
                    routing_key='portfolio_backend_queue',
                    body=json.dumps(response_payload)
                )
                print(f"[ML Consumer] Dispatched analysis completed event for: {portfolio_id}")
                
        except Exception as e:
            print(f"[ML Consumer] Error processing message: {e}")

    channel.basic_consume(
        queue='portfolio_ml_queue',
        on_message_callback=callback,
        auto_ack=True
    )
    print("[ML Consumer] Started listening on 'portfolio_ml_queue'...")
    channel.start_consuming()

def start_background_consumer():
    """Starts the RabbitMQ listener thread to avoid blocking FastAPI web thread."""
    t = threading.Thread(target=start_consumer, daemon=True)
    t.start()
