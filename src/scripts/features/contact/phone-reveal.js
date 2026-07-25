const PHONE_HREF = "tel:+79851354991";
const PHONE_DIGITS = "79851354991";
const PHONE_PREFIX = "+7 (985) 135 ";
const PHONE_TAIL = "49-91";
const PHONE_MASK = "••-••";
const PHONE_TEXT_PATTERN = /(?:\+7|8)?\s*\(985\)\s*135(?:\s|-)?49-91/g;
const PHONE_TEXT_TEST_PATTERN = /(?:\+7|8)?\s*\(985\)\s*135(?:\s|-)?49-91/;
const PHONE_TEXT_SKIP_SELECTOR =
  "a, button, script, style, noscript, textarea, [contenteditable='true'], .phone-reveal";

function createPhonePart(className, text) {
  const part = document.createElement("span");
  part.className = className;
  part.textContent = text;
  part.setAttribute("aria-hidden", "true");

  return part;
}

function revealPhone(event) {
  const link = event.currentTarget;

  if (link.classList.contains("phone-reveal--revealed")) {
    return;
  }

  event.preventDefault();
  link.classList.add("phone-reveal--revealed");
  link.setAttribute("aria-expanded", "true");
  link.setAttribute("aria-label", `Позвонить по номеру ${PHONE_PREFIX}${PHONE_TAIL}`);
}

function enhancePhoneLink(link) {
  if (link.dataset.phoneRevealReady === "true") {
    return;
  }

  const prefix = createPhonePart("phone-reveal__prefix", PHONE_PREFIX);
  const tail = document.createElement("span");
  const mask = createPhonePart("phone-reveal__mask", PHONE_MASK);
  const value = createPhonePart("phone-reveal__value", PHONE_TAIL);

  tail.className = "phone-reveal__tail";
  tail.setAttribute("aria-hidden", "true");
  tail.append(mask, value);

  link.replaceChildren(prefix, tail);
  link.classList.add("phone-reveal");
  link.dataset.phoneRevealReady = "true";
  link.setAttribute("aria-expanded", "false");
  link.setAttribute("aria-label", "Показать полный номер телефона");
  link.addEventListener("click", revealPhone);
}

function makeMobilePhoneClickable(root) {
  const phone = root.querySelector(".header__mobile-contacts-phone");

  if (!phone || phone.matches("a")) {
    return;
  }

  const link = document.createElement("a");
  link.className = phone.className;
  link.href = PHONE_HREF;
  link.textContent = phone.textContent;
  phone.replaceWith(link);
}

function enhancePhoneLinks(root) {
  const links = [];

  if (root instanceof window.Element && root.matches('a[href^="tel:"]')) {
    links.push(root);
  }

  if (root.querySelectorAll) {
    links.push(...root.querySelectorAll('a[href^="tel:"]'));
  }

  links.forEach(link => {
    const phoneDigits = link.getAttribute("href").replace(/\D/g, "");

    if (phoneDigits === PHONE_DIGITS) {
      enhancePhoneLink(link);
    }
  });
}

function wrapPhoneTextNode(textNode) {
  const text = textNode.textContent;
  const parent = textNode.parentElement;

  if (!parent || !PHONE_TEXT_TEST_PATTERN.test(text) || parent.closest(PHONE_TEXT_SKIP_SELECTOR)) {
    return;
  }

  const fragment = document.createDocumentFragment();
  let lastIndex = 0;

  text.replace(PHONE_TEXT_PATTERN, (match, offset) => {
    fragment.append(text.slice(lastIndex, offset));

    const link = document.createElement("a");
    link.href = PHONE_HREF;
    link.textContent = match;
    fragment.append(link);
    enhancePhoneLink(link);

    lastIndex = offset + match.length;
    return match;
  });

  fragment.append(text.slice(lastIndex));
  textNode.replaceWith(fragment);
}

function enhancePhoneText(root) {
  if (root.nodeType === window.Node.TEXT_NODE) {
    wrapPhoneTextNode(root);
    return;
  }

  const walker = document.createTreeWalker(root, window.NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    textNodes.push(walker.currentNode);
  }

  textNodes.forEach(wrapPhoneTextNode);
}

function enhancePhones(root) {
  enhancePhoneLinks(root);
  enhancePhoneText(root);
}

export function initPhoneReveal() {
  makeMobilePhoneClickable(document);
  enhancePhones(document.body);

  const observer = new window.MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(enhancePhones);
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
