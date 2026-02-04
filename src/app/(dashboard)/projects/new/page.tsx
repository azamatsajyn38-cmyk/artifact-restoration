import { CreateProjectForm } from "@/components/projects/create-project-form";

export default function NewProjectPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Новый проект</h1>
      <CreateProjectForm />
    </div>
  );
}
