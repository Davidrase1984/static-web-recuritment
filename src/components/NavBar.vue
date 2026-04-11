<template>
  <nav class="bg-white shadow-sm border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex items-center">
          <router-link to="/hr-admin" class="text-xl font-bold text-slate-900">
            Recruitment Dashboard
          </router-link>
        </div>
        <div class="flex items-center space-x-1">
          <router-link to="/apply"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/apply' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'">
            Apply
          </router-link>
          <router-link to="/hr-admin"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/hr-admin' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            HR Admin
          </router-link>
          <router-link to="/hiring-manager"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/hiring-manager' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            Hiring Manager
          </router-link>
          <router-link to="/director"
            class="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            :class="$route.path === '/director' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-100'">
            Director
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: "NavBar"
}
</script>
