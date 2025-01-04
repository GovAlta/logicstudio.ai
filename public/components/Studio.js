// components/Studio.js

import { useCanvases } from "../composables/useCanvases.js";
import AgentCard from "./AgentCard.js";
import InputCard from "./InputCard.js";
import OutputCard from "./OutputCard.js";
import TemplateCard from "./TemplateCard.js";
import CanvasToolbar from "./CanvasToolbar.js";

export default {
  name: "Studio",
  components: {
    AgentCard,
    InputCard,
    OutputCard,
    TemplateCard,
    CanvasToolbar,
  },
  template: `
    <div class="absolute inset-0 flex flex-col overflow-hidden">
        <!-- Top Toolbar -->
        <div class="flex items-center space-x-2 p-4 bg-gray-800 select-none z-40">

                  

        <div class="flex items-center gap-2">
          <InputText v-if="activeCanvas"
              v-model="activeCanvas.name"
              placeholder="Canvas Name"
              class="w-[32rem] !px-3 !py-2 !bg-gray-800 !text-gray-100 border-gray-700 !rounded-md"
              :class="[
                  'hover:border-gray-600',
                  'focus:!ring-2 focus:!ring-green-500 focus:!border-transparent !outline-none'
              ]"
          />
          <div v-if="canvases.length > 0" class="flex items-center gap-2">
              <button
                  @click="moveCanvasLeft"
                  
                  class="px-2 py-1 text-gray-300 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <i class="pi pi-chevron-left"></i>
              </button>
              <span class="text-sm text-gray-300">
                  {{ (activeCanvasIndex || 0) + 1 }} of {{ canvases.length }}
              </span>
              <button
                  @click="moveCanvasRight"
                 
                  class="px-2 py-1 text-gray-300 hover:bg-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  <i class="pi pi-chevron-right"></i>
              </button>
          </div>
      </div>    


            <div class="flex-1"></div>
            <button 
                class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                @click="zoomIn"
            >
                <i class="pi pi-plus mr-1"></i>
            </button>
            <button 
                class="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                @click="zoomOut"
            >
                <i class="pi pi-minus mr-1"></i>
            </button>
            <div class="text-gray-400 text-sm ml-2">
                {{ getZoomPercent() }}%
            </div>
        </div>

        <!-- Main Content Area -->
        <div 
            class="relative flex-1 bg-gray-900"
         
        >
            <!-- Side Toolbar -->
            <CanvasToolbar
                class="z-50"
                @add-card="handleToolbarAction"
                @export-png="exportToPNG"
                @export-json="exportToJSON"
                @import-json="importFromJSON"
                @update:expanded="(val) => toolbarExpanded = val"
                @update:show-text="(val) => toolbarShowText = val"
            />

            <!-- Scrollable Canvas Container -->
<div 
    class="absolute inset-0 canvas-container"
    ref="canvasRef"
    @wheel.prevent="handleWheel"
    @touchstart.prevent="handleTouchStart"
    @touchmove.prevent="handleTouchMove"
    @touchend.prevent="handleTouchEnd"
    :style="{
        overflow: 'scroll',  // Changed from auto to scroll
        position: 'absolute',
        width: '100%',
        height: '100%'
    }"
>
                <!-- Pan Background -->
 <div 
        class="absolute pan-background"
        ref="panBackground"
        @mousedown="handleBackgroundMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
        :style="{
            cursor: isPanning ? 'grabbing' : isOverBackground ? 'grab' : 'default',
            width: \`\${8000 * zoomLevel}px\`,  // Scale with zoom
            height: \`\${8000 * zoomLevel}px\`,  // Scale with zoom
            position: 'absolute',
            top: '0',
            left: '0',
            minWidth: '8000px',    // Ensure minimum size
            minHeight: '8000px'    // Ensure minimum size
        }"
    >
                    <!-- Grid Background -->
        <div 
            class="absolute inset-0"
            :style="{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
                backgroundSize: \`\${20 * zoomLevel}px \${20 * zoomLevel}px\`,
                backgroundPosition: '50% 50%',
                pointerEvents: 'none',
                width: '100%',
                height: '100%'
            }"
        ></div>

                    <!-- Content Layer -->
           <div 
                class="absolute"
                :style="{
                    transform: \`scale(\${zoomLevel})\`,
                    top: '4000px',
                    left: '4000px',
                    transformOrigin: '0 0'
                }"
            >
                        <!-- Connections Layer -->

                      

            <svg 
                class="absolute"
                :style="{
                    width: '8000px',
                    height: '8000px',
                    top: '-4000px',
                    left: '-4000px',
                }"
            >

              <defs>
                    <marker
                    id="arrowhead"
                    viewBox="0 -3 6 6"
                    refX="4"
                    refY="-.3"
                    markerWidth="6" 
                    markerHeight="6"
                    orient="auto"
                >
                    <path
                        d="M0,-2.0L5,0L0,2.0"
                        stroke="#64748b"
                        stroke-width=".5"
                        fill="#64748b"
                    />
                </marker>
                </defs>

                <path 
                    v-for="conn in activeConnections" 
                    :key="conn.id"
                    :d="drawSpline(conn.sourcePoint, conn.targetPoint)"
                    :stroke="getConnectionStyle(conn).stroke"
                    :stroke-width="getConnectionStyle(conn).strokeWidth"
                    fill="none"
                    style="pointer-events: all; cursor: pointer;"
                    marker-end="url(#arrowhead)"
                    @mousedown.stop
                    @click.stop="(e) => handleConnectionClick(e, conn.id)"
                />
                  
                
                <path
                  v-if="activeConnection"
                  :d="drawSpline(activeConnection.startPoint, activeConnection.currentPoint)"
                  stroke="#64748b"
                  stroke-dasharray="5,5"
                  stroke-width="2"
                  fill="transparent"
                    marker-end="url(#arrowhead)"
                  /> 
                </svg>

                        <!-- Cards Layer -->
                        <div class="relative" style="pointer-events: none;">
                            <component
                                v-for="card in activeCards"
                                :key="card.uuid"
                                :is="getCardComponent(card.type)"
                                :cardData="card"
                                :zoomLevel="zoomLevel"
                                :zIndex="card.zIndex"
                                :is-selected="selectedCardIds.has(card.uuid)"
                                @update-position="updateCardPosition"
                                @update-card="updateCard"
                                @update-socket-value="updateSocketValue"
                                @connection-drag-start="handleConnectionDragStart"
                                @connection-drag="handleConnectionDrag"
                                @connection-drag-end="handleConnectionDragEnd"
                                @close-card="removeCard"
                                @manual-trigger="handleManualTrigger"
                                @sockets-updated="handleSocketsUpdated"
                                @select-card="handleCardSelection"
                                style="pointer-events: auto;"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `,

  setup() {
    // Get canvas functionality from composable
    const {
      // Core state
      canvases,
      activeCanvas,
      activeCards,
      connections,
      zoomLevel,
      canvasRef,
      isPanning,
      isOverBackground,
      selectedCardIds,
      activeConnection,
      nearestSocket,
      activeConnections,
      activateConnection,

      activeCanvasIndex,
      moveCanvasLeft,
      moveCanvasRight,

      // Canvas management
      createCanvas,

      // Card management
      createCard,
      removeCard,
      updateCardPosition,

      //Connections management
      createConnection,
      removeConnection,
      socketRegistry,
      socketConnections,
      updateConnections,
      updateSocketValue,
      updateCardSockets,

      // Event handlers - Note the renamed handler
      handleBackgroundMouseDown, // This is what we got from useCanvases
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleWheel,
      handleCardSelection,
      handleConnectionClick,
      handleConnectionDragStart,
      handleConnectionDrag,
      handleConnectionDragEnd,

      findNearestSocket,
      selectedConnectionId,

      // Drawing utilities
      drawSpline,
      getConnectionStyle,

      // Import/Export
      exportToPNG,
      exportToJSON,
      importFromJSON,

      // Zoom/Pan controls
      zoomIn,
      zoomOut,
      centerCanvas,
      getZoomPercent,
      setZoom,
      panBackground,

      // Other utilities
      getScaledPoint,
      getWorldPoint,

      Z_INDEX_LAYERS,
      validateConnection,
      calculateConnectionPoints,
    } = useCanvases();

    // Local state
    const toolbarExpanded = Vue.ref(true);
    const toolbarShowText = Vue.ref(true);
    const initialized = Vue.ref(false);

    // Lifecycle hooks
    Vue.onMounted(() => {
      // Add keyboard event listener
      window.addEventListener("keydown", handleKeyDown);

      // Run setup after DOM is ready
      requestAnimationFrame(() => {
        if (!activeCanvas.value) createCanvas();
        if (!canvasRef.value) return;
        centerCanvas(false);
      });
    });

    Vue.onUnmounted(() => {
      window.removeEventListener("keydown", handleKeyDown);
      initialized.value = false;
    });

    // Component utility functions
    const getCardComponent = (type) => {
      switch (type) {
        case "template":
          return "TemplateCard";
        case "input":
          return "InputCard";
        case "output":
          return "OutputCard";
        case "agent":
        default:
          return "AgentCard";
      }
    };

   
    // Event handlers
    // const handleToolbarAction = (action) => {
     
    //   const cardId = createCard(action, null);

    //   if (cardId) {
    //     // Clear any existing selections
    //     selectedCardIds.value.clear();
    //     // Select the new card
    //     selectedCardIds.value.add(cardId);
    //   }
    // };


    const handleToolbarAction = (action) => {
        // First deselect all cards and reset their z-indexes
        // activeCards.value = activeCards.value.map(card => ({
        //   ...card,
        //   zIndex: Z_INDEX_LAYERS.DEFAULT
        // }));
        // selectedCardIds.value.clear();
  
        // Now create the new card with a high z-index
        const cardId = createCard(action, null);
  
        if (cardId) {
          // Find the new card and set its z-index
          activeCards.value = activeCards.value.map(card => {
            if (card.uuid === cardId) {
              return {
                ...card,
                zIndex: Z_INDEX_LAYERS.SELECTED
              };
            }
            return card;
          });
          
          // Select the new card
        //   selectedCardIds.value.add(cardId);
        }
      };

    const handleManualTrigger = (cardData) => {
      const connections = activeConnections.value.filter(
        (conn) => conn.sourceCardId === cardData.uuid
      );

      connections.forEach((conn) => {
        const sourceCard = activeCards.value.find(
          (c) => c.uuid === conn.sourceCardId
        );
        const targetCard = activeCards.value.find(
          (c) => c.uuid === conn.targetCardId
        );

        if (sourceCard && targetCard) {
          const sourceSocket = sourceCard.sockets.outputs.find(
            (s) => s.id === conn.sourceSocketId
          );
          if (sourceSocket && sourceSocket.value !== null) {
            updateSocketValue(
              targetCard.uuid,
              conn.targetSocketId,
              sourceSocket.value
            );
          }
        }
      });
    };

    // const updateCard = (cardId, updates) => {
    //   const card = activeCards.value.find((c) => c.uuid === cardId);
    //   if (!card) return;


    //   Object.assign(card, {
    //     ...updates,
    //     momentUpdated: Date.now(),
    //   });


    // };


    const updateCard = (updates) => {
        const cardIndex = activeCards.value.findIndex((c) => c.uuid === updates.uuid);
        if (cardIndex === -1) return;
      
        // Create a new object preserving reactive properties
        activeCards.value[cardIndex] = {
          ...activeCards.value[cardIndex],
          ...updates,
          momentUpdated: Date.now()
        };
        
        // Force reactivity update
        activeCards.value = [...activeCards.value];
      };

     // Was just for Inputs, a new version added for both.
     /*
const handleSocketsUpdated = async ({ oldSockets, newSockets, cardId, reindexMap, deletedSocketIds }) => {
    const card = activeCards.value.find(c => c.uuid === cardId);
    if (!card) return;
  
    // First, remove any connections to deleted sockets
    activeConnections.value = activeConnections.value.filter(conn => {
      if (conn.targetCardId === cardId) {
        return !deletedSocketIds.includes(conn.targetSocketId);
      }
      return true;
    });
  
    // Then update the remaining connections
    activeConnections.value = activeConnections.value.map(conn => {
      if (conn.targetCardId === cardId) {
        // Find the old socket's index
        const oldIndex = oldSockets.findIndex(s => s.id === conn.targetSocketId);
        if (oldIndex !== -1) {
          const newIndex = reindexMap[oldIndex];
          if (newIndex !== -1) {
            // Socket still exists, update the connection to point to the new socket
            const newSocket = newSockets[newIndex];
            return {
              ...conn,
              targetSocketId: newSocket.id
            };
          }
        }
      }
      return conn;
    });
  
    // Update the card's sockets
    card.sockets.inputs = newSockets;
  
    // Wait for Vue to update the DOM
    await Vue.nextTick();
  
    // Force a final recalculation of all affected connections
    requestAnimationFrame(() => {
      // Recalculate connection points for all connections targeting this card
      const updatedConnections = activeConnections.value.map(conn => {
        if (conn.targetCardId === cardId) {
          const points = calculateConnectionPoints({
            sourceCardId: conn.sourceCardId,
            sourceSocketId: conn.sourceSocketId,
            targetCardId: conn.targetCardId,
            targetSocketId: conn.targetSocketId
          });
          return { ...conn, ...points };
        }
        return conn;
      });
  
      activeConnections.value = updatedConnections;
    });
  };
  */

  const handleSocketsUpdated = async ({ oldSockets, newSockets, cardId, reindexMap, deletedSocketIds, type }) => {
    const card = activeCards.value.find(c => c.uuid === cardId);
    if (!card) return;
  
    // First, remove any connections to deleted sockets
    activeConnections.value = activeConnections.value.filter(conn => {
      // Check for deleted sockets based on the socket type
      if (type === 'input' && conn.targetCardId === cardId) {
        return !deletedSocketIds.includes(conn.targetSocketId);
      }
      if (type === 'output' && conn.sourceCardId === cardId) {
        return !deletedSocketIds.includes(conn.sourceSocketId);
      }
      return true;
    });
  
    // Then update the remaining connections
    activeConnections.value = activeConnections.value.map(conn => {
      // Handle input socket connections
      if (type === 'input' && conn.targetCardId === cardId) {
        const oldIndex = oldSockets.findIndex(s => s.id === conn.targetSocketId);
        if (oldIndex !== -1) {
          const newIndex = reindexMap[oldIndex];
          if (newIndex !== -1) {
            const newSocket = newSockets[newIndex];
            return {
              ...conn,
              targetSocketId: newSocket.id
            };
          }
        }
      }
      // Handle output socket connections
      else if (type === 'output' && conn.sourceCardId === cardId) {
        const oldIndex = oldSockets.findIndex(s => s.id === conn.sourceSocketId);
        if (oldIndex !== -1) {
          const newIndex = reindexMap[oldIndex];
          if (newIndex !== -1) {
            const newSocket = newSockets[newIndex];
            return {
              ...conn,
              sourceSocketId: newSocket.id
            };
          }
        }
      }
      return conn;
    });
  
    // Update the card's sockets based on type
    if (type === 'input') {
      card.sockets.inputs = newSockets;
    } else if (type === 'output') {
      card.sockets.outputs = newSockets;
    }
  
    // Wait for Vue to update the DOM
    await Vue.nextTick();
  
    // Force a final recalculation of all affected connections
    requestAnimationFrame(() => {
      // Recalculate connection points for all affected connections
      const updatedConnections = activeConnections.value.map(conn => {
        if ((type === 'input' && conn.targetCardId === cardId) || 
            (type === 'output' && conn.sourceCardId === cardId)) {
          const points = calculateConnectionPoints({
            sourceCardId: conn.sourceCardId,
            sourceSocketId: conn.sourceSocketId,
            targetCardId: conn.targetCardId,
            targetSocketId: conn.targetSocketId
          });
          return { ...conn, ...points };
        }
        return conn;
      });
  
      activeConnections.value = updatedConnections;
    });
  };

    const handleKeyDown = (event) => {
        // First check if we're in an input element
        const target = event.target;
        
        // Check if we're in any kind of input element
        if (target.tagName === 'INPUT' || 
            target.tagName === 'TEXTAREA' || 
            target.getAttribute('contenteditable') === 'true') {
          // Always allow normal typing in input elements
          return;
        }
      
        // Now handle deletion keys
        if (event.key === "Delete" || event.key === "Backspace") {
          // Handle connection deletion first if one is selected
          if (selectedConnectionId.value) {
            const connIndex = activeConnections.value.findIndex(
              (conn) => conn.id === selectedConnectionId.value
            );
            
            if (connIndex !== -1) {
              removeConnection(selectedConnectionId.value);
              // Force reactivity update
              activeConnections.value = [...activeConnections.value];
              selectedConnectionId.value = null;
            }
            event.preventDefault();
            return;
          }
      
          // Then handle card deletion if cards are selected
          if (selectedCardIds.value.size > 0) {
            const cardsToRemove = Array.from(selectedCardIds.value);
            cardsToRemove.forEach(removeCard);
            selectedCardIds.value.clear();
            event.preventDefault();
            return;
          }
        }
      };


    // Watch for zoom changes to update connections
    Vue.watch(
      zoomLevel,
      () => {
        Vue.nextTick(() => {
          if (activeConnections.value) {
            activeConnections.value.forEach((conn) => {
              if (conn.sourceCardId) {
                updateConnections(conn.sourceCardId);
              }
            });
          }
        });
      },
      { flush: "post" }
    );

    return {
      // State
      canvases,
      activeCanvas,
      activeCards,
      activeConnections,
      connections,
      activateConnection,
      zoomLevel,
      canvasRef,
      isPanning,
      isOverBackground,
      selectedCardIds,
      activeConnection,
      nearestSocket,
      toolbarExpanded,
      toolbarShowText,
      selectedConnectionId,

      activeCanvasIndex,
      moveCanvasLeft,
      moveCanvasRight,

      // Functions
      getCardComponent,
      getConnectionStyle,
      handleToolbarAction,
      handleConnectionClick,
      handleManualTrigger,
      updateCard,
      handleSocketsUpdated,
      updateCardSockets,

      // Event handlers
      // Event handlers
      handleBackgroundMouseDown, // Changed from handleMouseDown
      handleMouseMove,
      handleMouseUp,
      handleMouseLeave,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      handleWheel,
      handleCardSelection,
      findNearestSocket,
      selectedConnectionId,

      handleConnectionDragStart,
      handleConnectionDrag,
      handleConnectionDragEnd,

      //   handleSocketDragStart,
      //   handleSocketDrag,
      //   handleSocketDragEnd,

      // Operations
      updateCardPosition,
      removeCard,
      drawSpline,
      updateSocketValue,
      panBackground,

      // Zoom/Pan controls
      zoomIn,
      zoomOut,
      getZoomPercent,

      // Export/Import
      exportToPNG,
      exportToJSON,
      importFromJSON,

      Z_INDEX_LAYERS

    };
  },
};
