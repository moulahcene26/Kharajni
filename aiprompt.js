const API_KEY = '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';

const selectedCountries = new Set();
const selectedMajors = new Set();
const selectedDegrees = new Set();

function toggleSelection(element, categorySet) {
    const text = element.querySelector('p').textContent;
    let s=element.children[1];

    if (categorySet.has(text)) {
        categorySet.delete(text);
        element.style.backgroundColor = "#EFE9D5";
        s.style.color = "#143D60";
    } else {
        categorySet.add(text);
        element.style.backgroundColor = "#143D60";
        s.style.color = "#EFE9D5";

    } 
}

document.querySelectorAll('.country').forEach(el => {
    el.addEventListener('click', () => toggleSelection(el, selectedCountries));
});
document.querySelectorAll('.major').forEach(el => {
    el.addEventListener('click', () => toggleSelection(el, selectedMajors));
});
document.querySelectorAll('.degree').forEach(el => {
    el.addEventListener('click', () => toggleSelection(el, selectedDegrees));
});

function showPopup(data = null, isLoading = true) {
    let popup = document.getElementById('ai-popup');

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'ai-popup';
        document.body.appendChild(popup);
    }
    popup.style.width = '400px';
    popup.style.height = '400px';
    popup.style.overflowY = 'scroll';
    popup.style.borderRadius = '20px';
    popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
    popup.innerHTML = `
        <div class="popup-content" >
            <span class="close-btn">&times;</span>
            <h2>AI Suggestions</h2>
            ${isLoading ? '<div class="loader"></div>' : formatUniversityData(data)}
        </div>
    `;

    document.querySelector('.close-btn').addEventListener('click', () => {
        popup.remove();
    });
}

function formatUniversityData(universities) {
    if (!Array.isArray(universities)) {
        return "<p>Invalid response format. Please try again.</p>";
    }

    return universities.map(uni => `
        <div class="university">
            <h1 style="color: #143D60;"><b>${uni.name}</b></h1>
            <p><span class="bold">Country:</span> ${uni.country}</p>
            <p><span class="bold">Tuition Fees:</span> $${uni.fees}</p>
        </div>
    `).join("");
}


async function getAIResponse(prompt) {
    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'meta-llama/llama-3.2-90b-vision-instruct:free',
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: prompt }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error:', error);
        return `Error: ${error.message}`;
    }
}

async function handleAIRequest() {
    if (selectedCountries.size === 0 || selectedMajors.size === 0 || selectedDegrees.size === 0) {
        alert("Please select at least one country, major, and degree before proceeding.");
        return;
    }

    const userMessage = `I want to study in ${[...selectedCountries].join(", ")}, the ${[...selectedMajors].join(", ")}, as a ${[...selectedDegrees].join(", ")}. Now briefly tell me about the best universities or colleges that provide this , only their names with their tuition fees, briefly, nothing else but their name, their country, and their fees in dollars, no extra description, no extra words, just JSON format. , the json lines contain "name" "country" "fees" with this exact syntax do not change the names of these types in the json.`;

    console.log("User Request:", userMessage);
    showPopup(null, true);

    try {
        const response = await getAIResponse(userMessage);


        const jsonMatch = response.match(/\[.*\]/s);

        if (!jsonMatch) {
            throw new Error("Invalid JSON format received.");
        }

        let myString = jsonMatch[0];
        console.log("Extracted JSON:", myString);

        const data = JSON.parse(myString);
        showPopup(data, false);
        console.log("Parsed Data:", data);

    } catch (error) {
        console.error('Error fetching AI response:', error);
        showPopup("Error fetching response. Please try again.", false);
    }
}

document.getElementById('submit').addEventListener('click', handleAIRequest);
