let POST_REPLACEMENT_TEXT = '💩 Bullshit';
let BANNED_WORDS: string[] = ['elon', 'musk', 'trump', 'biden', 'israel', 'putin', 'afd', 'weidel'];
const BANNED_POST_CLASSES = ['celebration', 'announcement'];

// Load initial configuration
chrome.storage.local.get(['bannedWords', 'replacementText'], data => {
  BANNED_WORDS = data.bannedWords || BANNED_WORDS;
  POST_REPLACEMENT_TEXT = data.replacementText || POST_REPLACEMENT_TEXT;
  filterPosts();
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
    const updateDiv = post.querySelector('.update-components-text');
    if (updateDiv) {
      const spans = updateDiv.querySelectorAll('span');
      postText = Array.from(spans)
        .map(span => span.textContent || '')
        .join(' ')
        .toLowerCase();
    }

    // Check if the post contains any banned words
    if (
      BANNED_WORDS.some(word => {
        // Only match words that are not part of a larger word and surrounded by a whitespace in before or after
        const pattern = new RegExp(`(^|\\s)${word}(\\s|$)`, 'i');
        return pattern.test(postText);
      })
    ) {
      hide(post as HTMLElement);
    }

    // Check if the post contains any banned post classes
    if (
      BANNED_POST_CLASSES.some(type => {
        const elements = post.querySelectorAll(`[class*="${type}"]`);
        return elements.length > 0;
      })
    ) {
      hide(post as HTMLElement);
    }
  });
}

function hide(post: HTMLElement) {
  post.classList.add('filtered-post-opaque');

  // Hide all relevant children
  const updateDiv = post.querySelector('.update-components-text');
  if (updateDiv) {
    const children = (updateDiv as HTMLElement).children;
    Array.from(children).forEach(child => {
      if (!(child as HTMLElement).className.includes('filtered-post-replacement')) {
        (child as HTMLElement).classList.add('filtered-post-hidden');
      }
    });
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

  // Hide socials like likes, comments, etc.
  const socials = post.querySelectorAll('.update-v2-social-activity');
  Array.from(socials).forEach(social => {
    (social as HTMLElement).classList.add('filtered-post-hidden');
  });

  // Add bullshit span
  const replacementDiv = document.createElement('div');
  replacementDiv.classList.add('filtered-post-replacement-container');
  replacementDiv.style.paddingBottom = '10px';

  const replacementText = document.createElement('span');
  replacementText.classList.add('filtered-post-replacement-text');
  replacementText.textContent = POST_REPLACEMENT_TEXT;
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
  if (!(updateDiv as HTMLElement).querySelector('.filtered-post-replacement-container')) {
    (updateDiv as HTMLElement).appendChild(replacementDiv);
  }
}

function unhide(post: HTMLElement) {
  // Remove classes from post itself
  post.classList.remove('filtered-post-opaque', 'filtered-post-hidden');

  // Add exception class to post to not be hidden again on next scroll
  post.classList.add('filtered-post-exception');

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
    unhide(post as HTMLElement);
  });
}

function getAllPosts(): HTMLElement[] {
  const posts = document.querySelectorAll('div[data-id^="urn:li:activity:"]');
  return Array.from(posts) as HTMLElement[];
}

chrome.runtime.onMessage.addListener(action => {
  switch (action.type) {
    case 'disable-filter': {
      unfilterPosts();
      document.removeEventListener('scroll', filterPosts);
      break;
    }
    case 'config-updated': {
      chrome.storage.local.get(['bannedWords', 'replacementText'], data => {
        BANNED_WORDS = data.bannedWords || [];
        POST_REPLACEMENT_TEXT = data.replacementText || '💩 Bullshit';
        unfilterPosts();
        filterPosts();
      });
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
