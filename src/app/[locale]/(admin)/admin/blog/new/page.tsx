import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { PostForm } from "@/components/admin/post-form";

export default function NewPostPage() {
  return (
    <>
      <AdminPageHeader title="Yeni Yazı" />
      <PostForm />
    </>
  );
}
