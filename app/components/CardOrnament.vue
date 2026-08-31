<template>
  <div v-if="style !== 'none'" aria-hidden="true" class="ornament-layer" :style="{ '--ornament-color': color }">
    
    <!-- Botanical Corners: Elegant leafy branches in the corners -->
    <template v-if="style === 'botanical-corners'">
      <svg class="ornament-corner ornament-corner-tl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 10 Q 60 10 190 190" stroke="var(--ornament-color)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M 10 0 Q 10 60 140 140" stroke="var(--ornament-color)" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5"/>
        <!-- Main Branch Leaves -->
        <path d="M 40 20 C 50 15 70 20 60 35 C 50 45 35 30 40 20 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 80 40 C 95 35 110 45 100 60 C 90 75 70 55 80 40 Z" fill="var(--ornament-color)" opacity="0.75"/>
        <path d="M 130 80 C 145 75 160 85 150 100 C 140 115 120 95 130 80 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <!-- Secondary Branch Leaves -->
        <path d="M 20 50 C 15 65 25 80 40 70 C 55 60 30 40 20 50 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 50 90 C 45 105 55 120 70 110 C 85 100 60 80 50 90 Z" fill="var(--ornament-color)" opacity="0.5"/>
        <!-- Small Buds -->
        <circle cx="90" cy="20" r="3" fill="var(--ornament-color)" opacity="0.7"/>
        <circle cx="140" cy="50" r="2.5" fill="var(--ornament-color)" opacity="0.6"/>
        <circle cx="170" cy="130" r="2" fill="var(--ornament-color)" opacity="0.5"/>
      </svg>
      <svg class="ornament-corner ornament-corner-tr" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 10 Q 60 10 190 190" stroke="var(--ornament-color)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M 10 0 Q 10 60 140 140" stroke="var(--ornament-color)" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5"/>
        <path d="M 40 20 C 50 15 70 20 60 35 C 50 45 35 30 40 20 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 80 40 C 95 35 110 45 100 60 C 90 75 70 55 80 40 Z" fill="var(--ornament-color)" opacity="0.75"/>
        <path d="M 130 80 C 145 75 160 85 150 100 C 140 115 120 95 130 80 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 20 50 C 15 65 25 80 40 70 C 55 60 30 40 20 50 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 50 90 C 45 105 55 120 70 110 C 85 100 60 80 50 90 Z" fill="var(--ornament-color)" opacity="0.5"/>
        <circle cx="90" cy="20" r="3" fill="var(--ornament-color)" opacity="0.7"/>
        <circle cx="140" cy="50" r="2.5" fill="var(--ornament-color)" opacity="0.6"/>
        <circle cx="170" cy="130" r="2" fill="var(--ornament-color)" opacity="0.5"/>
      </svg>
      <svg class="ornament-corner ornament-corner-bl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 10 Q 60 10 190 190" stroke="var(--ornament-color)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M 10 0 Q 10 60 140 140" stroke="var(--ornament-color)" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5"/>
        <path d="M 40 20 C 50 15 70 20 60 35 C 50 45 35 30 40 20 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 80 40 C 95 35 110 45 100 60 C 90 75 70 55 80 40 Z" fill="var(--ornament-color)" opacity="0.75"/>
        <path d="M 130 80 C 145 75 160 85 150 100 C 140 115 120 95 130 80 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 20 50 C 15 65 25 80 40 70 C 55 60 30 40 20 50 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 50 90 C 45 105 55 120 70 110 C 85 100 60 80 50 90 Z" fill="var(--ornament-color)" opacity="0.5"/>
        <circle cx="90" cy="20" r="3" fill="var(--ornament-color)" opacity="0.7"/>
        <circle cx="140" cy="50" r="2.5" fill="var(--ornament-color)" opacity="0.6"/>
        <circle cx="170" cy="130" r="2" fill="var(--ornament-color)" opacity="0.5"/>
      </svg>
      <svg class="ornament-corner ornament-corner-br" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 10 Q 60 10 190 190" stroke="var(--ornament-color)" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.85"/>
        <path d="M 10 0 Q 10 60 140 140" stroke="var(--ornament-color)" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.5"/>
        <path d="M 40 20 C 50 15 70 20 60 35 C 50 45 35 30 40 20 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 80 40 C 95 35 110 45 100 60 C 90 75 70 55 80 40 Z" fill="var(--ornament-color)" opacity="0.75"/>
        <path d="M 130 80 C 145 75 160 85 150 100 C 140 115 120 95 130 80 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 20 50 C 15 65 25 80 40 70 C 55 60 30 40 20 50 Z" fill="var(--ornament-color)" opacity="0.6"/>
        <path d="M 50 90 C 45 105 55 120 70 110 C 85 100 60 80 50 90 Z" fill="var(--ornament-color)" opacity="0.5"/>
        <circle cx="90" cy="20" r="3" fill="var(--ornament-color)" opacity="0.7"/>
        <circle cx="140" cy="50" r="2.5" fill="var(--ornament-color)" opacity="0.6"/>
        <circle cx="170" cy="130" r="2" fill="var(--ornament-color)" opacity="0.5"/>
      </svg>
    </template>

    <!-- Floral Wreath: A delicate center top wreath -->
    <template v-else-if="style === 'floral-wreath'">
      <svg class="ornament-wreath" viewBox="0 0 400 150" fill="none" preserveAspectRatio="xMidYMin meet">
        <path d="M 40 120 C 40 10 360 10 360 120" stroke="var(--ornament-color)" stroke-width="1.2" opacity="0.5" stroke-linecap="round"/>
        <path d="M 60 110 C 60 30 340 30 340 110" stroke="var(--ornament-color)" stroke-width="0.8" opacity="0.3" stroke-linecap="round"/>
        
        <!-- Floral Centerpiece -->
        <g fill="var(--ornament-color)">
          <path d="M 200 45 C 190 30 210 30 200 45 Z" opacity="0.9"/>
          <circle cx="200" cy="45" r="4" opacity="0.9"/>
          <circle cx="185" cy="48" r="2.5" opacity="0.7"/>
          <circle cx="215" cy="48" r="2.5" opacity="0.7"/>
        </g>
        
        <!-- Side Leaf Clusters -->
        <path d="M 110 65 C 95 50 125 45 120 65 Z" fill="var(--ornament-color)" opacity="0.65"/>
        <path d="M 290 65 C 305 50 275 45 280 65 Z" fill="var(--ornament-color)" opacity="0.65"/>
        
        <circle cx="75" cy="95" r="2" fill="var(--ornament-color)" opacity="0.5"/>
        <circle cx="325" cy="95" r="2" fill="var(--ornament-color)" opacity="0.5"/>
      </svg>
    </template>

    <!-- Minimal Arch: A sweeping elegant border framing the content -->
    <template v-else-if="style === 'minimal-arch'">
      <svg class="ornament-full" viewBox="0 0 400 600" fill="none" preserveAspectRatio="none">
         <path d="M 30 600 L 30 220 A 170 170 0 0 1 370 220 L 370 600" stroke="var(--ornament-color)" stroke-width="1.5" opacity="0.6"/>
         <path d="M 42 600 L 42 220 A 158 158 0 0 1 358 220 L 358 600" stroke="var(--ornament-color)" stroke-width="0.5" opacity="0.35"/>
      </svg>
    </template>

    <!-- Geometric Deco: Art deco style border framework -->
    <template v-else-if="style === 'geometric-deco'">
      <svg class="ornament-full" viewBox="0 0 400 600" fill="none" preserveAspectRatio="none">
         <rect x="20" y="20" width="360" height="560" stroke="var(--ornament-color)" stroke-width="1.5" opacity="0.6"/>
         <rect x="30" y="30" width="340" height="540" stroke="var(--ornament-color)" stroke-width="0.5" opacity="0.35"/>
         <path d="M 20 60 L 60 20 M 340 20 L 380 60 M 380 540 L 340 580 M 60 580 L 20 540" stroke="var(--ornament-color)" stroke-width="1.5" opacity="0.6"/>
      </svg>
    </template>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ style?: string; color?: string }>(), {
  style: 'none',
  color: 'currentColor'
})
</script>

<style scoped>
.ornament-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

/* Corner Positioning */
.ornament-corner {
  position: absolute;
  width: clamp(80px, 18vw, 150px);
  height: clamp(80px, 18vw, 150px);
}

.ornament-corner-tl { top: 0; left: 0; }
.ornament-corner-tr { top: 0; right: 0; transform: scaleX(-1); }
.ornament-corner-bl { bottom: 0; left: 0; transform: scaleY(-1); }
.ornament-corner-br { bottom: 0; right: 0; transform: scale(-1, -1); }

/* Wreath Positioning */
.ornament-wreath {
  position: absolute;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: min(90%, 420px);
  height: auto;
}

/* Full Borders (Arch & Deco) Positioning */
.ornament-full {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  padding: 1rem;
}
</style>