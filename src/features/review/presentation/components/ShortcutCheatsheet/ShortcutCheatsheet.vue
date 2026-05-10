<script setup lang="ts">
import { NModal, NTag } from 'naive-ui'

defineProps<{ show: boolean }>()
defineEmits<{ 'update:show': [value: boolean] }>()

const groups = [
  {
    title: 'Navegación',
    items: [
      { keys: ['↑', '↓'], desc: 'Cambiar de tarjeta' },
      { keys: ['←', '→'], desc: 'Foto anterior / siguiente' },
      { keys: ['1'], desc: 'Saltar a Placas' },
      { keys: ['2'], desc: 'Saltar a Casco' },
      { keys: ['3'], desc: 'Saltar a Ropa' },
      { keys: ['4'], desc: 'Saltar a Bicicleta' },
    ],
  },
  {
    title: 'Edición',
    items: [
      { keys: ['Tab', 'Enter'], desc: 'Entrar a editar tarjeta' },
      { keys: ['Enter'], desc: 'Guardar tarjeta (dentro del input)' },
      { keys: ['Esc'], desc: 'Cancelar edición' },
    ],
  },
  {
    title: 'Acciones',
    items: [
      { keys: ['⌘', 'Enter'], desc: 'Guardar y avanzar (intencional)' },
      { keys: ['A'], desc: 'Agregar manual (según sección activa)' },
      { keys: ['Espacio'], desc: 'Ver crop ampliado' },
      { keys: ['F'], desc: 'Toggle filtro Solo no revisadas' },
    ],
  },
  {
    title: 'Foto',
    items: [
      { keys: ['D'], desc: 'Descargar foto' },
      { keys: ['U'], desc: 'Subir retocada' },
      { keys: ['Z'], desc: 'Reiniciar zoom' },
      { keys: ['C'], desc: 'Activar / salir modo comparar' },
    ],
  },
  {
    title: 'Modo comparar (cuando está activo)',
    items: [
      { keys: ['1'], desc: 'Ver Original' },
      { keys: ['2'], desc: 'Comparar (slider)' },
      { keys: ['3'], desc: 'Ver Retocada' },
    ],
  },
]
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Atajos de teclado"
    style="max-width: 540px"
    @update:show="$emit('update:show', $event)"
  >
    <div class="shortcut-cheatsheet">
      <section v-for="group in groups" :key="group.title" class="shortcut-cheatsheet__group">
        <h4>{{ group.title }}</h4>
        <ul>
          <li v-for="item in group.items" :key="item.desc">
            <span class="shortcut-cheatsheet__keys">
              <NTag v-for="k in item.keys" :key="k" size="small" round>{{ k }}</NTag>
            </span>
            <span>{{ item.desc }}</span>
          </li>
        </ul>
      </section>
    </div>
  </NModal>
</template>

<style scoped src="./shortcut-cheatsheet.css" />
