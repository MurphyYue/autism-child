import { Card } from '@/components/ui/card';
import { Brain, MessageCircle, UserPlus } from 'lucide-react';
import Link from 'next/link';
import {useTranslations} from 'next-intl';


export default function Home() {
  const t = useTranslations('Home');
  return (
    <div className="flex-1 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-auto max-w-4xl">
          <FeatureCard
            icon={<UserPlus className="h-8 w-8" />}
            title={t("profle_management")}
            description={t("profle_management_desc")}
            href="/profiles"
          />
          <FeatureCard
            icon={<Brain className="h-8 w-8" />}
            title={t("structured_scenarios")}
            description={t("structured_scenarios_desc")}
            href="/scenarios"
          />
          <FeatureCard
            icon={<MessageCircle className="h-8 w-8" />}
            title={t("conversation_simulation")}
            description={t("conversation_simulation_desc")}
            href="/chat"
          />
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