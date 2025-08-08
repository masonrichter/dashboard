import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

type Client = {
  id: number;
  name: string;
  email: string;
  company: string;
  tags: string[];
  lastModified: string;
  phone?: string;
  title?: string;
  address?: string;
  city?: string;
  details?: string;
  websites?: string[];
  customFields?: any[];
};

export default function ClientCard({ client }: { client: Client }) {
  const lastModified = new Date(client.lastModified).toLocaleDateString();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
      <div>
        <h3 className="text-xl font-bold text-gray-900">{client.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{client.company}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {client.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <p className="text-xs text-gray-500">Last Modified: {lastModified}</p>
        <Link
          href={`/clients?clientId=${client.id}`}
          className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Client <ArrowRightIcon className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}