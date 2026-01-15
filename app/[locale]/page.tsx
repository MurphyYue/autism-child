import { Card } from "@/components/ui/card";
import { Brain, MessageCircle, UserPlus, Star } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Home - Star Cat",
  description:
    "Welcome to Star Cat - An app to help parents communicate with their children with autism.",
};

export default function Home() {
  const t = useTranslations("Home");
  return (
    <div className="flex-1">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/home_bg_3.jpg')] bg-cover dark:opacity-10 opacity-30"></div>
        <div className="container mx-auto px-4 py-16 sm:py-24 relative z-10 bg-white bg-opacity-40 dark:bg-opacity-0">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
              <div className="inline-block p-2 bg-blue-400 dark:bg-blue-900 rounded-lg mb-4">
                <Star className="h-6 w-6 text-yellow-500" />
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-r from-red-700 via-red-400 to-yellow-400 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 animate-gradient-x filter drop-shadow-lg">
                {t("title")}
              </h1>
              <p className="text-base md:text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-white dark:via-purple-400 dark:to-pink-400 max-w-xl mb-8">
                {t("subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  href="/chat"
                  className="px-6 py-3 dark:bg-blue-600 bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 dark:bg-opacity-40 bg-opacity-70 hover:bg-opacity-100"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">
                    {t("start_to_use")}
                  </span>
                </Link>
                {/* <Link
                  href="/about"
                  className="px-6 py-3 bg-gray-600 hover:from-gray-100 hover:via-gray-50 hover:to-gray-100 dark:hover:from-gray-600 dark:hover:via-gray-500 dark:hover:to-gray-600 text-gray-800 dark:text-white font-medium rounded-lg border border-gray-200 dark:border-gray-600 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:-translate-y-0.5 bg-opacity-40 hover:bg-opacity-100"
                >
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-200 dark:to-white">
                    了解更多
                  </span>
                </Link> */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute -inset-[10%] top-0 h-full w-[120%]"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(184, 196, 255, 0.6), transparent 25%), " +
                "radial-gradient(circle at 70% 60%, rgba(255, 184, 222, 0.6), transparent 25%), " +
                "radial-gradient(circle at 40% 80%, rgba(184, 255, 214, 0.6), transparent 25%), " +
                "radial-gradient(circle at 80% 30%, rgba(255, 222, 184, 0.6), transparent 25%)",
            }}
          ></div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t("main_function")}
            </h2>
            <p className="text-base md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              {t("main_function_desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mx-auto max-w-6xl">
            <FeatureCard
              icon={<UserPlus className="h-10 w-10" />}
              title={t("profle_management")}
              description={t("profle_management_desc")}
              href="/profiles"
              color="bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300"
              bgColor="bg-purple-300 dark:bg-purple-900 dark:bg-opacity-30"
            />
            <FeatureCard
              icon={<Brain className="h-10 w-10" />}
              title={t("structured_scenarios")}
              description={t("structured_scenarios_desc")}
              href="/scenarios"
              color="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300"
              bgColor="bg-green-300 dark:bg-green-900 dark:bg-opacity-30"
            />
            <FeatureCard
              icon={<MessageCircle className="h-10 w-10" />}
              title={t("conversation_simulation")}
              description={t("conversation_simulation_desc")}
              href="/chat"
              color="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
              bgColor="bg-blue-300 dark:bg-blue-900 dark:bg-opacity-30"
            />
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      {/* <div className="bg-white dark:bg-gray-800 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              用户反馈
            </h2>
          </div>
          <div className="max-w-4xl mx-auto bg-blue-50 dark:bg-gray-700 p-8 rounded-2xl shadow-lg">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍👧</span>
              </div>
              <p className="text-lg italic text-gray-700 dark:text-gray-300 mb-6">
                "星童沟通助手帮助我和我的孩子建立了更好的沟通方式。通过结构化场景，我们的日常互动变得更加顺畅，孩子的情绪也更加稳定。"
              </p>
              <p className="font-medium text-gray-900 dark:text-white">
                李先生，6岁自闭症儿童的父亲
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* CTA Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/home_bg_2.jpg')] bg-contain dark:opacity-10 opacity-30"></div>
        <div className="container mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 md:p-12 shadow-xl">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                {t("start_to_communicate")}
              </h2>
              <p className="text-base md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {t("start_to_communicate_desc")}
              </p>
              <Link
                href="/profiles"
                className="inline-block px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                {t("free_to_use")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  href,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
  bgColor?: string;
}) {
  return (
    <Card
      className={`p-8 hover:shadow-xl transition-all transform hover:-translate-y-1 border-0 rounded-xl overflow-hidden relative ${bgColor} bg-opacity-30`}
    >
      <div className="absolute inset-0"></div>
      <Link href={href} className="space-y-6 relative z-10">
        <div
          className={`w-16 h-16 rounded-lg flex items-center justify-center ${color}`}
        >
          {icon}
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300">{description}</p>
        <div className="pt-2 flex items-center text-blue-600 dark:text-blue-400 font-medium">
          <span>了解更多</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </Link>
    </Card>
  );
}
