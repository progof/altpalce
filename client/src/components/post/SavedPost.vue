<script setup lang="ts">
import { defineProps } from "vue";
import { useAddSavedPostMutation } from "@/services/post.service";
import SaveIcon from "@/assets/icons/SaveIcon.svg?component";

const { mutate: savedPost, error } = useAddSavedPostMutation();

const props = defineProps<{ postId: string }>();

const addPostToList = () => {
  savedPost({ postId: props.postId });
};
</script>

<template>
  <span v-if="error">{{ error }}</span>
  <button @click="addPostToList" class="button">
    <SaveIcon style="width: 24px; height: 24px" />
  </button>
</template>

<style scoped>
.button {
  background-color: rgba(0, 0, 0, 0);
  border: none;
  cursor: pointer;
}

div {
  display: inline-block;
  margin-left: 5px;
}
</style>
