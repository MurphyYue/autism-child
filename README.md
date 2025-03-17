# autism child

This is a Next.js-based application designed to help parents communicate with autistic children using AI-powered behavioral simulations.

## Features

- **User Registration & Login**: Secure authentication for parents.
- **Child Profile Management**: Input and update child-specific behavioral and sensory information.
- **Structured Scenario Input**: Parents describe real-life situations, which are processed into structured data.
- **AI Simulated Conversations**: Engage in interactive dialogues with an AI that mimics autistic children.
- **Expert Guidance**: AI provides feedback and suggestions to improve parent-child interactions.

## Tech Stack

- **Frontend**: Next.js (React, TypeScript)
- **Backend & Database**: Supabase
- **AI Processing**: Dify Chatflow API

## Installation

1. Clone the repository:
   ```sh
   git clone git@github.com:MurphyYue/autism-child.git
   cd autism-child
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Configure environment variables (create a `.env.local` file):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
   DIFY_API_KEY=<your_dify_api_key>
   ```
4. Run the development server:
   ```sh
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.


## Deployment

1. Build the project:
   ```sh
   npm run build
   ```
2. Start the production server:
   ```sh
   npm start
   ```
3. Deploy to Vercel (recommended):
   ```sh
   vercel
   ```

## API Reference

- **Supabase Authentication**: Handles user login and registration.
- **Supabase Database**: Stores user and child profile data.
- **Dify AI API**: Handles structured scenario analysis and interactive simulations.

## Contribution

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add feature"`).
4. Push the branch (`git push origin feature-name`).
5. Open a Pull Request.

## License

MIT License

