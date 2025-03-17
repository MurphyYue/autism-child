import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Brain, MessageCircle, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Autism Communication Assistant
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Empowering parents to better communicate with and understand their children through AI-assisted tools and structured interactions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard
            icon={<UserPlus className="h-8 w-8" />}
            title="Profile Management"
            description="Create and manage detailed profiles for your children"
            href="/profiles"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Behavior Tracking"
            description="Record and analyze behavioral patterns"
            href="/behaviors"
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title="Structured Scenarios"
            description="Create and manage structured interaction scenarios"
            href="/scenarios"
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8" />}
            title="AI Communication"
            description="Get AI-assisted communication suggestions"
            href="/chat"
          />
        </div>

        <div className="mt-16 text-center">
          <Button asChild size="lg">
            <Link href="/auth/login">
              Get Started
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <Link href={href} className="space-y-4">
        <div className="text-primary">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
      </Link>
    </Card>
  );
}