import { AddTaskFormCard } from '../components/add-task/AddTaskFormCard'
import { AddTaskPageHeader } from '../components/add-task/AddTaskPageHeader'
import { AddTaskPreviewPanel } from '../components/add-task/AddTaskPreviewPanel'
import { useAddTaskForm } from '../hooks/useAddTaskForm'

export function AddTask() {
  const {
    form,
    tagDraft,
    setTagDraft,
    errors,
    durationSelectValue,
    updateField,
    addTag,
    removeTag,
    clearForm,
    submit,
    createSuccess,
    isSubmitting,
  } = useAddTaskForm()

  return (
    <div className="add-task-page flex w-full min-w-0 flex-col gap-2 pb-2">
      <AddTaskPageHeader />

      <div className="add-task-layout-grid min-w-0">
        <div className="add-task-form-column">
          <AddTaskFormCard
            form={form}
            durationSelectValue={durationSelectValue}
            errors={errors}
            tagDraft={tagDraft}
            createSuccess={createSuccess}
            onTagDraftChange={setTagDraft}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onChange={updateField}
            onClear={clearForm}
            onCreate={submit}
            isSubmitting={isSubmitting}
          />
        </div>

        <div className="add-task-preview-column min-w-0">
          <AddTaskPreviewPanel form={form} />
        </div>
      </div>
    </div>
  )
}
