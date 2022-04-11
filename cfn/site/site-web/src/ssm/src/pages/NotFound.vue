<template>
  <div class="bg-blue-500">
    <div class="container mx-auto">
      <div class="h-screen flex justify-center">
        <div class="self-center">
          <div class="flex flex-col gap-y-8 text-center">
            <div class="text-4xl text-white flex gap-4">
              <div>
                <font-awesome-icon :icon="['fas', 'exclamation']" />
              </div>
              <div>Not Found</div>
              <div>
                <font-awesome-icon :icon="['fas', 'exclamation']" />
              </div>
            </div>
            <div>
              <router-link
                class="px-8 py-2 bg-white hover:bg-gray-200 rounded text-gray-700 text-xl"
                to="/"
              >
                Go to Home
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
