# PermitPilot 
### Adaptive Permits & Compliance Copilot for Small Businesses
**Built for "The UI Strikes Back" Hackathon**

[Live Demo](https://permitpilot-app.vercel.app/) | [Video Demo](#)

## The Problem
Starting a business involves navigating a maze of permits, licenses, and compliance rules that vary by city and business type. Founders often get stuck in static "wizard" forms that don't adapt when plans change (e.g., switching from a food truck to a brick-and-mortar restaurant).

##  The Solution
**PermitPilot** is a Generative UI agent that builds the compliance roadmap *for* you. Instead of a static form, you chat with an AI that:
1.  **Understand your intent:** "I want to open a food truck in Hyderabad."
2.  **Generates custom UI cards:** Shows exact costs, documents, and risk flags for *that* specific location.
3.  **Updates persistent panels:** As you change your plan ("Actually, make it a cafe"), the checklist, timeline, and business profile update in real-time.

## 🛠️ How we used Tambo
This project pushes the boundaries of Generative UI by combining ephemeral and persistent components:

* **Generative Components (Ephemeral):** The agent decides when to render `CostBreakdownCard`, `RiskFlagsCard`, and `OfficeMapCard` based on the conversation context.
* **Interactable Components (Persistent):** The sidebar panels (`BusinessProfile`, `PermitChecklist`, `Timeline`) are always present. The agent uses `withInteractable` tools to update their state dynamically without refreshing the page.
* **Location Intelligence:** We integrated **Geoapify** to resolve any city in the world to its country and currency, allowing the UI to adapt globally (e.g., showing `₹` for India, `€` for Paris).

##  Tech Stack
* **Framework:** Next.js (React)
* **AI SDK:** Tambo (Generative UI + Agents)
* **Styling:** Tailwind CSS
* **Tools:** Geoapify (Geocoding), REST Countries (Currency)

##  Run Locally
1.  Clone the repo:
    ```bash
    git clone [https://github.com/SachinMyadam/agents.md.git](https://github.com/SachinMyadam/agents.md.git)
    cd agents.md
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables in `.env.local`:
    ```bash
    NEXT_PUBLIC_TAMBO_API_KEY=your_tambo_key
    GEOAPIFY_API_KEY=your_geoapify_key
    ```
4.  Run the dev server:
    ```bash
    npm run dev
    ```
