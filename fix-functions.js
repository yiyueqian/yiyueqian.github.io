/**
 * Fix for missing JavaScript functions in index.html
 * This file defines all the missing hover functions to prevent JavaScript errors
 */

// Function to safely get element and apply opacity
function safeSetOpacity(elementId, opacity) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.opacity = opacity;
    } else {
        console.warn(`Element with ID '${elementId}' not found`);
    }
}

// Missing function definitions
function collabeval_start() {
    safeSetOpacity('collabeval_image', '1');
}

function collabeval_stop() {
    safeSetOpacity('collabeval_image', '0');
}

function hygcladt_stop() {
    safeSetOpacity('hygcladt_image', '0');
}

function hygcladt_start() {
    safeSetOpacity('hygcladt_image', '1');
}

// Initialize all stop functions on page load to set initial opacity
document.addEventListener('DOMContentLoaded', function() {
    // Set initial opacity for all hover images
    const imageIds = [
        'llmimbalance_image',
        'ecommerce_image', 
        'collabeval_image',
        'adgsmote_image',
        'hygcladt_image',
        'hygcldc_image',
        'cmigcl_image',
        'rep2vec_image',
        'clahg_image',
        'neurips_image',
        'ijcai_image',
        'kg_image',
        'drugstyle_image',
        'ddi_image',
        'alpha_image',
        'community_image'
    ];
    
    imageIds.forEach(id => {
        safeSetOpacity(id, '0');
    });
    
    console.log('✅ Hover functions initialized successfully');
});
