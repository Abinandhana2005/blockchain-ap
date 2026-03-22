import os
import json
import random

os.makedirs('data/resumes', exist_ok=True)

templates = [
    """Name: {name}
Email: {email}
Phone: +91 9999999999

PROFESSIONAL EXPERIENCE
Senior Software Engineer at Google (5 years)
- Led ML projects
- Built distributed systems
- Improved performance 40%

EDUCATION
B.Tech Computer Science, IIT Delhi
CGPA: 8.5/10

SKILLS
Python, Java, Machine Learning, Cloud, Docker, Kubernetes

PROJECTS
Swarm Learning System - Blockchain + ML
Resume Screening AI - NLP classifier
Data Engineering Platform""",
    
    """Name: {name}
Email: {email}

PROFESSIONAL EXPERIENCE
Junior Developer (1 year)
- Basic web development
- Helped with maintenance

EDUCATION
Diploma, Delhi Institute
CGPA: 6.2/10

SKILLS
JavaScript, HTML, CSS

PROJECTS
Simple Website""",

    """Name: {name}
Email: {email}
Phone: {phone}

EXPERIENCE
Software Developer at TechCorp (3 years)
- Built backend systems
- Worked with Python and Java
- Led 5 engineers

EDUCATION
B.Tech IT, Mumbai University
CGPA: 7.8/10

SKILLS
Python, Java, AWS, Docker, SQL

ACHIEVEMENTS
- Patent filed for optimization algorithm
- Presented at 2 international conferences
- Open source contributor""",

    """Name: {name}
Email: {email}

BACKGROUND
Worked at startup
- Basic coding tasks

EDUCATION
High School Graduate

SKILLS
Basic programming""",
]

names = ["Rajesh Kumar", "Priya Singh", "Arjun Patel", "Neha Sharma", "Vikram Das", "Sunita Roy", "Arun Verma", "Sneha Gupta"]
phones = ["+91 9999999999", "+91 8888888888", "+91 7777777777"]

# Create 50 resumes
resumes = []
labels = []

for i in range(50):
    name = random.choice(names)
    email = f"{name.lower().replace(' ', '.')}@email.com"
    phone = random.choice(phones)
    template = random.choice(templates)
    
    content = template.format(name=name, email=email, phone=phone)
    
    filepath = f'data/resumes/resume_{i+1}.txt'
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    resumes.append(f"resume_{i+1}.txt")
    
    # MIX of 0s and 1s - IMPORTANT!
    # First 25 are selected (label=1)
    # Next 25 are rejected (label=0)
    label = 1 if i < 25 else 0
    labels.append(label)

# Create labels file
data = {
    'resumes': resumes,
    'labels': labels,
    'selected_count': 25,
    'rejected_count': 25
}

with open('data/labels.json', 'w') as f:
    json.dump(data, f, indent=2)

print("✓ Generated 50 resumes")
print("✓ 25 selected (label=1)")
print("✓ 25 rejected (label=0)")
print("✓ Created labels.json")
print("\nVerify:")
print(f"Labels: {labels}")
print(f"Count 0s: {labels.count(0)}")
print(f"Count 1s: {labels.count(1)}")
