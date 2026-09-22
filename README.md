# Gov Scheme Finder

ஆம் 👍 Lovable prompt limit இருக்கிறதுனால short but complete-ஆ கொடுக்கிறேன். இதை direct-a paste பண்ணலாம்:



Build a complete REAL full-stack web app called “Sri Scheme Finder” with the tagline “Discover the Government Schemes You’re Eligible For.”



Use React + TypeScript + Tailwind CSS for frontend, Node.js + Express REST API for backend, and MongoDB + Mongoose for database. Do NOT create a static/mock-only website.



Design



Create a unique, modern government-tech UI using deep navy + royal purple + teal/cyan + white, gradients, modern cards, icons, subtle animations and responsive layouts. No Lovable branding anywhere. Fully responsive on mobile, tablet and desktop.



Main Pages



Home, Explore Schemes, Scheme Details, Eligibility Checker, About, Contact, Sign Up, Sign In, User Dashboard, Profile, Saved Schemes and Admin Dashboard.



Authentication



Implement REAL backend authentication:



- Sign Up with name, email, phone, password, confirm password

- Sign In / Logout

- JWT authentication

- bcrypt password hashing

- Protected routes

- Role-based User/Admin access

- Store users in MongoDB



User Features



Users can update:

age, gender, state, district, occupation, annual income, category, education, student status, farmer status and disability status.



Dashboard must show recommended schemes, saved schemes and profile completion.



Government Schemes



Support BOTH:



1. Central Government schemes

2. State Government schemes, initially including Tamil Nadu, with architecture for all Indian states.



Categories: Agriculture, Farmers, Education, Scholarships, Health, Women, Child Welfare, Employment, Housing, Finance, Social Welfare, Skill Development, Youth, Senior Citizens, Disability, Entrepreneurship, MSME and Rural Development.



Use REAL and VERIFIED government scheme information. Do not invent schemes, eligibility rules or official URLs. Store official source, official URL and last verified date.



Scheme Features



Backend-powered:



- Search

- Government-level filter

- State filter

- Category filter

- Beneficiary filter

- Scheme details

- Benefits

- Eligibility

- Required documents

- Application process

- Official website

- Apply button using stored official URL

- Save/Unsave schemes in MongoDB



Eligibility Checker



Create “Find Schemes For Me”. User details are sent to the backend. Backend compares them with eligibility rules stored in MongoDB and returns:



- Eligible

- Potentially Eligible

- Not Eligible



Show the matching/missing criteria. Do NOT hard-code results in frontend.



Admin Panel



Secure Admin Dashboard with:



- Total users/schemes

- Add/Edit/Delete schemes

- Central/State selection

- State/category management

- Eligibility-rule management

- Official URL/source management

- Activate/deactivate schemes

- User management

- Contact-message management



Backend APIs



Implement real REST APIs for:

"/api/auth/signup"

"/api/auth/login"

"/api/auth/logout"

"/api/users/profile"

"/api/schemes"

"/api/schemes/:id"

"/api/schemes/:id/save"

"/api/users/saved-schemes"

"/api/eligibility/check"

"/api/admin/*"



Use controllers, routes, middleware, validation, error handling and role authorization.



Database



Create MongoDB models for:

User, Scheme, SavedScheme, ContactMessage



Scheme fields should include:

name, level, state, category, department, description, benefits, eligibilityRules, documents, applicationProcess, ageLimit, incomeLimit, beneficiaryType, officialWebsite, officialApplicationUrl, lastVerifiedDate and status.



Important



Frontend → Backend → MongoDB must actually connect. No fake APIs, dummy buttons, hard-coded dashboard statistics, fake authentication or placeholder functionality.



Add loading/error/empty states.



Create ".env.example" and README with MongoDB setup, environment variables, local run and deployment instructions.



Footer disclaimer:

“Sri Scheme Finder is an informational platform, not an official government website. Verify the latest scheme information on the relevant official government portal before applying.”



Build the complete working application, not just the UI.இந்த version Lovable limit-க்கு relatively compact, ஆனா backend details miss ஆகாமல் வைத்திருக்கிறது.build thre website very fast

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://scheme-advisor.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/19e6f159-ee9e-4c0a-b6c0-f719edc94c96).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
