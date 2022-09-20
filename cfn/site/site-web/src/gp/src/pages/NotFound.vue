<template>
  <div class="bg-background">
    <div class="container mx-auto">
      <div class="h-screen flex justify-center">
        <div class="self-center">
          <div class="flex flex-col gap-y-8 text-center">
            <div class="text-3xl text-white flex gap-4">
              <!-- <div>
                <font-awesome-icon :icon="['fas', 'exclamation']" />
              </div> -->
              <div>Page not found</div>
              <!-- <div>
                <font-awesome-icon :icon="['fas', 'exclamation']" />
              </div> -->
            </div>
            <div>
              <router-link
                class="px-8 py-2 bg-white hover:bg-gray-200 rounded text-gray-700 text-xl"
                to="/"
              >
                Go to homepage
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
