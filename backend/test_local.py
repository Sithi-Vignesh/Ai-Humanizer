from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_PATH = "./AI_detection_model"
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_PATH)
model.eval()
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

def detect(text):
    inputs = tokenizer(
        text[:512],
        return_tensors="pt",
        truncation=True,
        max_length=512
    ).to(device)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = torch.softmax(outputs.logits, dim=1)
        ai_percent = probs[0][0].item() * 100
        human_percent = probs[0][1].item() * 100

    label = "AI" if ai_percent > 50 else "Human"
    print(f"Label     : {label}")
    print(f"AI        : {ai_percent:.2f}%")
    print(f"Human     : {human_percent:.2f}%")
    print("-" * 40)

# --- Test cases ---
# tests = [
#     ("CLEARLY AI ESSAY", "Climate change represents one of the most pressing challenges of our time. The unprecedented rise in global temperatures, driven by anthropogenic greenhouse gas emissions, has resulted in widespread environmental degradation. Policymakers must adopt comprehensive strategies that balance economic development with ecological sustainability to address this multifaceted crisis effectively."),

#     ("CLEARLY HUMAN ESSAY", "i honestly dont know where to start with this essay. climate change is bad, everyone knows that. i remember my teacher showing us this graph last year and it was pretty scary how fast things are going up. i think we should probably do something about it but its hard when like big companies dont care."),

#     ("MIXED/BORDERLINE", "Social media has changed the way we communicate with each other. I think it has both good and bad sides. On one hand, it helps people stay connected with friends and family. But on the other hand, there's a lot of misinformation spreading around and it can be really bad for mental health, especially for younger people who spend too much time scrolling."),

#     ("AI ACADEMIC ESSAY", "The Renaissance period marked a profound transformation in European intellectual and cultural life. Characterized by a renewed interest in classical antiquity, humanist philosophy, and empirical inquiry, this era laid the foundational principles upon which modern Western civilization was subsequently constructed. Scholars such as Leonardo da Vinci and Erasmus exemplified the polymath ideal central to Renaissance thought."),

#     ("HUMAN STUDENT ESSAY", "When I first learned about the Renaissance in class, I thought it was just about famous paintings. But it turns out it was way more than that. People started thinking differently about science and religion and stuff. Like Galileo got in trouble just for saying the earth goes around the sun which seems crazy to us now but back then it was a big deal."),
# ]

# for label, text in tests:
#     print(f"Test: {label}")
#     detect(text)

print("Label mapping:", model.config.id2label)
print("Num labels:", model.config.num_labels)