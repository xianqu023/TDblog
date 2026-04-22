import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditDocumentClient from "./EditDocumentClient";

interface EditDocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-[#f5f6f8] dark:bg-[#13151a] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/documents"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">编辑文档</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">修改文档内容和设置</p>
          </div>
        </div>
      </div>
      
      <EditDocumentClient documentId={id} />
    </div>
  );
}
