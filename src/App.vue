<template>
  <div>
    <p>Message: {{ message }}</p>
    <p v-if="error" style="color: red;">Error: {{ error }}</p>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      message: "",
      error: null
    };
  },
  async mounted() {
    try {
      const response = await fetch("/api/message");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      this.message = data.text;
    } catch (err) {
      this.error = err.message;
      console.error('Fetch error:', err);
    }
  }
};
</script>