<script setup lang="ts">
import { ref } from "vue";
import { z } from "zod";
import { useRoute } from "vue-router";
import { useCreateNoteMutation } from "@/services/app.service";
import { getMeQueryOptions } from "@/services/auth.service";
import { useQuery } from "@tanstack/vue-query";
import MyButton from "@/components/UI/MyButton.vue";
import { QuillEditor } from "@vueup/vue-quill";
import "quill/dist/quill.snow.css";
import { marked } from "marked";
import { useRouter } from "vue-router";
const $router = useRouter();
const { data: me } = useQuery(getMeQueryOptions);

const convertToMarkdown = (html: string) => {
  return marked(html);
};

const quillOptions = ref({
  modules: {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ header: 1 }, { header: 2 }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ direction: "rtl" }],
      [{ size: ["small", false, "large", "huge"] }],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ color: [] }, { background: [] }], // Add color and background options
      [{ font: [] }],
      [{ align: [] }],
      ["clean"],
      ["link", "image"],
    ],
  },
  formats: [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "code-block",
    "list",
    "bullet",
    "script",
    "indent",
    "direction",
    "color",
    "background",
    "link",
    "image",
    "video",
    "align",
  ],
  theme: "snow",
});

const noteBodyContent = ref<string>("");

const validationSchema = z.object({
  spaceId: z.string().refine((value) => value.trim() !== "", {
    message: "Space ID is required",
  }),
  title: z.string().refine((value) => value.trim() !== "", {
    message: "Title is required",
  }),
  description: z.string().refine((value) => value.trim() !== "", {
    message: "Description is required",
  }),
  body: z.string().refine(
    (value) => {
      if (typeof value === "string") {
        return value.trim() !== "";
      }
      return false;
    },
    {
      message: "Body is required",
    }
  ),
  category: z.string().refine((value) => value.trim() !== "", {
    message: "Category is required",
  }),
});

const validationErrors = ref<{
  spaceId?: string;
  title?: string;
  description?: string;
  body?: string;
  category?: string;
}>({});

const route = useRoute();
const spaceId: string = Array.isArray(route.params.id)
  ? route.params.id[0]
  : route.params.id;
console.log("Add note -> spaceID:", spaceId);

const { mutate: noteCreate, isPending, error } = useCreateNoteMutation();

const submitForm = async (event: Event) => {
  const rawData = Object.fromEntries(
    new FormData(event.target as HTMLFormElement)
  );

  // Add spaceId to rawData
  rawData.spaceId = spaceId;

  console.log("noteBodyContent", noteBodyContent.value);
  console.log("Raw data:", rawData);
  console.log("My user_id:", me.value?.user_id);

  rawData.body = convertToMarkdown(noteBodyContent.value);
  console.log("rawData.note_body", rawData.body);
  const result = validationSchema.safeParse(rawData);

  console.log("Validation result:", result);
  if (!result.success) {
    console.log("Validation failed:", result.error);
    const error = result.error;
    validationErrors.value.title = error.issues.find(
      (issue) => issue.path[0] === "note_title"
    )?.message;
    validationErrors.value.description = error.issues.find(
      (issue) => issue.path[0] === "note_description"
    )?.message;
    validationErrors.value.body = error.issues.find(
      (issue) => issue.path[0] === "note_body"
    )?.message;
    validationErrors.value.category = error.issues.find(
      (issue) => issue.path[0] === "note_category"
    )?.message;
    return;
  }
  validationErrors.value = {};

  console.log("Data to be sent:", result.data);
  noteCreate(result.data, {
    onError: (err) => {
      console.error("Error creating note:", err);
    },
  });
  $router.push(`/spaces/${spaceId}`);
};
</script>

<template>
  <div class="conteiner">
    <form @submit.prevent="submitForm">
      <fieldset>
        <label for="note_title">Title:</label>
        <input
          type="text"
          id="note_title"
          name="title"
          placeholder="Title..."
        />
        <span v-if="validationErrors.title">{{ validationErrors.title }}</span>
      </fieldset>

      <fieldset>
        <label for="note_category">Category:</label>
        <select id="note_category" name="category" style="color: black">
          <option value="" disabled selected>Select a category</option>
          <option value="IT">🧑‍💻 IT</option>
          <option value="Eco">🌽 Eco</option>
          <option value="Build">👷‍♂️ Build</option>
          <option value="Art">🧑‍🎨 Art</option>
          <option value="Crypto">🚀 Crypto</option>
        </select>
        <span v-if="validationErrors.category">{{
          validationErrors.category
        }}</span>
      </fieldset>

      <fieldset>
        <label for="note_description">Description:</label>
        <textarea
          type="text"
          id="note_description"
          name="description"
          placeholder="Description..."
        />
        <span v-if="validationErrors.description">{{
          validationErrors.description
        }}</span>
      </fieldset>

      <div class="editor-container">
        <fieldset>
          <label for="note_body">Body:</label>
          <QuillEditor
            v-model:content="noteBodyContent"
            theme="snow"
            id="note_body"
            placeholder="Description..."
            name="body"
            :options="quillOptions"
            contentType="html"
          />

          <span v-if="validationErrors.body">{{ validationErrors.body }}</span>
        </fieldset>
      </div>

      <span v-if="error">{{ error }}</span>

      <MyButton type="submit" :disabled="isPending">
        {{ isPending ? "Fetching..." : "Create note" }}
      </MyButton>
    </form>
  </div>
</template>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  margin: 50px;
}

h2 {
  color: rgb(45, 0, 128);
}

span {
  display: block;
  margin-bottom: 10px;
  color: rgb(227, 227, 227);
}

form {
  margin-top: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  color: rgb(201, 201, 201);
}

input,
textarea,
section {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  color: black;
}

button[type="submit"] {
  background-color: rgb(55, 146, 225);
  color: white;
}

fieldset {
  border: none;
}

.ql-editor {
  height: 20vh;
  border-color: black;
}

select {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
}

select:focus {
  outline: none;
  border: 1px solid rgb(42, 49, 49);
  background-color: #f0f0f0;
}

select option {
  font-size: 14px;
  color: teal;
}
</style>
@/components/ui/MyButton.vue
