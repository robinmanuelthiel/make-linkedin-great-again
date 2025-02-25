import { Configuration, DEFAULT_CONFIG } from './types';

let currentConfig: Configuration = DEFAULT_CONFIG;

// Load initial configuration
chrome.storage.sync.get('config', result => {
  if (result.config) {
    currentConfig = result.config;
    filterPosts();
  }
});

function filterPosts() {
  const posts = getAllPosts();
  posts.forEach(post => {
    // Skip posts that have been hidden before
    if (post.classList.contains('filtered-post-exception')) {
      return;
    }

    // Get the post text only from spans within update-components-text div
    let postText = '';
    const updateDivs = post.querySelectorAll('.update-components-text');
    updateDivs.forEach(updateDiv => {
      const spans = updateDiv.querySelectorAll('span');
      postText += Array.from(spans)
        .map(span => span.textContent || '')
        .join(' ')
        .toLowerCase();
    });

    // Check if the post contains any banned words
    if (
      // Only match words that are not part of a larger word and surrounded by a whitespace or beginning/end of string in before or after
      // Also allow punctuation marks as word boundaries at the end of the word
      currentConfig.bannedWords.some(word => {
        // Updated pattern to include punctuation marks as word boundaries
        const pattern = new RegExp(`(^|\\s)${word}(\\s|$|[\\s.,!?;]|\\W)`, 'i');
        return pattern.test(postText);
      })
    ) {
      hide(post as HTMLElement);
    }

    // Check if the post contains any banned post classes
    if (
      currentConfig.bannedPostClasses.some(type => {
        const elements = post.querySelectorAll(`[class*="${type}"]`);
        return elements.length > 0;
      })
    ) {
      hide(post as HTMLElement);
    }
  });
}

function hide(post: HTMLElement) {
  if (currentConfig.filterMode === 'none') {
    return; // Don't apply any filtering
  }

  if (currentConfig.filterMode === 'fade') {
    post.classList.add('filtered-post-opaque');
  } else {
    post.classList.add('filtered-post-hidden');
  }

  // Hide post text
  const textDiv = post.querySelector('.update-components-text');
  if (textDiv) {
    (textDiv as HTMLElement).classList.add('filtered-post-hidden');
  }

  // Hide see more button
  const seeMore = post.querySelector('.see-more');
  if (seeMore) {
    (seeMore as HTMLElement).classList.add('filtered-post-hidden');
  }

  // Hide all update components like videos, images, etc.)
  const hideExceptions = ['actor', 'header', 'text'];
  const updateComponentDivs = Array.from(post.querySelectorAll('[class^="update-components-"]')).filter(
    el => !hideExceptions.some(exception => el.className.includes(`update-components-${exception}`))
  );
  Array.from(updateComponentDivs).forEach(updateDiv => {
    (updateDiv as HTMLElement).classList.add('filtered-post-hidden');
  });

  // Hide shared content if any. Update content has a class that 'update-content-wrapper' in its name
  const sharedContent = post.querySelector('[class*="update-content-wrapper"]');
  if (sharedContent) {
    (sharedContent as HTMLElement).classList.add('filtered-post-hidden');
  }

  // Hide socials like likes, comments, etc.
  const socials = post.querySelectorAll('.update-v2-social-activity');
  Array.from(socials).forEach(social => {
    (social as HTMLElement).classList.add('filtered-post-hidden');
  });

  // Add replacement text
  const replacementDiv = document.createElement('div');
  replacementDiv.classList.add('filtered-post-replacement-container');
  replacementDiv.style.padding = '.5em';
  replacementDiv.style.textAlign = 'center';
  replacementDiv.style.borderTop = '1px solid rgb(0 0 0 / 15%)';
  replacementDiv.style.fontSize = '90%';

  const replacementText = document.createElement('span');
  replacementText.classList.add('filtered-post-replacement-text');
  replacementText.textContent = currentConfig.replacementText;
  replacementText.className = 'bullshit';

  const showButton = document.createElement('a');
  showButton.classList.add('filtered-post-replacement-show-button');
  showButton.textContent = 'Show anyways';
  showButton.style.paddingInline = '10px';
  showButton.style.cursor = 'pointer';
  showButton.addEventListener('click', () => {
    unhide(post as HTMLElement);
  });

  replacementDiv.appendChild(replacementText);
  replacementDiv.appendChild(showButton);

  const impressionContainer = post.querySelector('.fie-impression-container');
  if (!(impressionContainer as HTMLElement).querySelector('.filtered-post-replacement-container')) {
    (impressionContainer as HTMLElement).appendChild(replacementDiv);
  }
}

function unhide(post: HTMLElement, preventHide: boolean = true) {
  // Remove classes from post itself
  post.classList.remove('filtered-post-opaque', 'filtered-post-hidden');

  if (preventHide) {
    // Add exception class to post to not be hidden again on next scroll
    post.classList.add('filtered-post-exception');
  }

  // Remove classes from all descendants recursively
  const allDescendants = post.getElementsByTagName('*');
  Array.from(allDescendants).forEach(element => {
    (element as HTMLElement).classList.remove('filtered-post-opaque', 'filtered-post-hidden');
  });

  // Remove filtered-post-replacement-container
  const showContainer = post.querySelector('.filtered-post-replacement-container');
  if (showContainer) {
    showContainer.remove();
  }
}

// Shows all hidden posts again
function unfilterPosts() {
  const posts = getAllPosts();
  Array.from(posts).forEach(post => {
    unhide(post as HTMLElement, false);
  });
}

function getAllPosts(): HTMLElement[] {
  const posts = document.querySelectorAll('div[data-urn^="urn:li:activity:"]');
  return Array.from(posts) as HTMLElement[];
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'CONFIG_UPDATED': {
      currentConfig = message.config;
      unfilterPosts(); // Clear existing filters
      filterPosts(); // Reapply with new config
      break;
    }
    case 'disable-filter': {
      unfilterPosts();
      document.removeEventListener('scroll', filterPosts);
      break;
    }
    default:
      break;
  }
});

// Filter posts on page load
filterPosts();

// Filter posts on scroll
document.addEventListener('scroll', filterPosts);
