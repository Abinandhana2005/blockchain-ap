import os
import json
import random

os.makedirs('data/resumes', exist_ok=True)

template = """Name: {name}
Email: {email}
Phone: +91 9999999999

PROFESSIONAL EXPERIENCE
{title} (varies)
- Built systems
- Led teams
- Improved performance

SKILLS
Python, Java, ML, Cloud

EDUCATION
{school}

PROJECTS
Swarm Learning, ML Model, Blockchain"""

names = ["Rajesh Kumar", "Priya Singh", "Arjun Patel", "Neha Sharma", "Vikram Das"]
schools = ["IIT Delhi", "IIT Bombay", "Delhi University", "Bangalore University"]
titles = ["Senior Software Engineer", "Junior Developer", "ML Engineer", "Full Stack Developer"]

for i in range(50):
    name = random.choice(names)
    email = f"{name.lower().replace(' ', '.')}@gmail.com"
    school = f"{random.choice(schools)}, {random.randint(6, 9)}.{random.randint(0, 9)}/10"
    title = random.choice(titles)
    
    content = template.format(name=name, email=email, school=school, title=title)
    
    with open(f'data/resumes/resume_{i+1}.txt', 'w') as f:
        f.write(content)

# Create labels
labels = [1 if i < 25 else 0 for i in range(50)]

data = {
    'resumes': [f"resume_{i+1}.txt" for i in range(50)],
    'labels': labels,
    'selected_count': 25,
    'rejected_count': 25
}

with open('data/labels.json', 'w') as f:
    json.dump(data, f, indent=2)

print("✓ Generated 50 synthetic resumes!")
print("✓ Created labels.json")