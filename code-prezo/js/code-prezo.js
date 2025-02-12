/**
 * @file Code Prezo Script
 * @description Provides functionality for formatting, presenting, and managing code in the Code Prezo web app.
 * Handles syntax highlighting, language detection, code reformatting, and user interactions.
 *
 * @dependencies
 * - jQuery (https://code.jquery.com/jquery-3.6.4.min.js)
 * - Prettier (https://cdn.jsdelivr.net/npm/prettier@2.8.8/standalone.js)
 * - Highlight.js (https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/highlight.min.js)
 * - Prettier Plugins:
 *   - parser-babel.js
 *   - parser-html.js
 *   - parser-postcss.js
 *   - parser-json.js
 *   - parser-markdown.js
 *   - parser-typescript.js
 *   - parser-css.js
 * 
 *
 * @author Wes Modes
 * @version 0.9.0
 * @license MIT
 */

$(document).ready(function () {

  /**
   * Application state to manage code and detected language.
   * @type {Object}
   * @property {string} rawCode - Original input code.
   * @property {string} formattedCode - Reformatted code.
   * @property {string} language - Detected programming language.
   */
  const appState = {
    rawCode: '',
    formattedCode: '',
    language: 'Unknown',
  };

  /**
   * List of Highlight.js themes with their IDs and display names.
   * @type {Array<{id: string, name: string}>}
   */
  const darkThemes = [
    { id: "a11y-dark", name: "A11y Dark" },
    { id: "an-old-hope", name: "An Old Hope" },
    { id: "atom-one-dark", name: "Atom One Dark" },
    { id: "atom-one-dark-reasonable", name: "Atom One Dark Reasonable" },
    { id: "dracula", name: "Dracula" },
    { id: "github-dark", name: "GitHub Dark" },
    { id: "github-dark-dimmed", name: "GitHub Dark Dimmed" },
    { id: "gradient-dark", name: "Gradient Dark" },
    { id: "ir-black", name: "IR Black" },
    { id: "kimbie.dark", name: "Kimbie Dark" },
    { id: "monokai", name: "Monokai" },
    { id: "monokai-sublime", name: "Monokai Sublime" },
    { id: "night-owl", name: "Night Owl" },
    { id: "nnfx-dark", name: "NNFX Dark" },
    { id: "nord", name: "Nord" },
    { id: "obsidian", name: "Obsidian" },
    { id: "panda-syntax-dark", name: "Panda Syntax Dark" },
    { id: "paraiso-dark", name: "Paraiso Dark" },
    { id: "srcery", name: "Srcery" },
    { id: "stackoverflow-dark", name: "Stack Overflow Dark" },
    { id: "sunburst", name: "Sunburst" },
    { id: "tokyo-night-dark", name: "Tokyo Night Dark" },
    { id: "tomorrow-night", name: "Tomorrow Night" },
    { id: "zenburn", name: "Zenburn" },
  ];
  const lightThemes = [
    { id: "a11y-light", name: "A11y Light" },
    { id: "arduino-light", name: "Arduino Light" },
    { id: "atom-one-light", name: "Atom One Light" },
    { id: "github", name: "GitHub" },
    { id: "github-gist", name: "GitHub Gist" },
    { id: "gradient-light", name: "Gradient Light" },
    { id: "isbl-editor-light", name: "ISBL Editor Light" },
    { id: "kimbie.light", name: "Kimbie Light" },
    { id: "lightfair", name: "Lightfair" },
    { id: "panda-syntax-light", name: "Panda Syntax Light" },
    { id: "paraiso-light", name: "Paraiso Light" },
    { id: "qtcreator_light", name: "QtCreator Light" },
    { id: "rainbow", name: "Rainbow" },
    { id: "stackoverflow-light", name: "Stack Overflow Light" },
    { id: "tokyo-night-light", name: "Tokyo Night Light" },
  ];
  const otherThemes = [
    { id: "agate", name: "Agate" },
    { id: "androidstudio", name: "Android Studio" },
    { id: "brown-paper", name: "Brown Paper" },
    { id: "codepen-embed", name: "CodePen Embed" },
    { id: "color-brewer", name: "Color Brewer" },
    { id: "dark", name: "Dark" },
    { id: "default", name: "Default" },
    { id: "docco", name: "Docco" },
    { id: "far", name: "Far" },
    { id: "foundation", name: "Foundation" },
    { id: "gml", name: "GML" },
    { id: "googlecode", name: "Google Code" },
    { id: "grayscale", name: "Grayscale" },
    { id: "hybrid", name: "Hybrid" },
    { id: "idea", name: "IDEA" },
    { id: "lioshi", name: "Lioshi" },
    { id: "magula", name: "Magula" },
    { id: "mono-blue", name: "Mono Blue" },
    { id: "pojoaque", name: "Pojoaque" },
    { id: "purebasic", name: "PureBasic" },
    { id: "routeros", name: "RouterOS" },
    { id: "school-book", name: "School Book" },
    { id: "shades-of-purple", name: "Shades of Purple" },
    { id: "tomorrow", name: "Tomorrow" },
    { id: "vs", name: "VS" },
    { id: "vs2015", name: "VS2015" },
    { id: "xcode", name: "Xcode" },
    { id: "xt256", name: "XT256" },
  ];
  // Group themes into categories
  const groupedThemes = {
    "Dark Themes": darkThemes,
    "Light Themes": lightThemes,
    "Other Themes": otherThemes,
  };
  // Combine all themes into a single array for loading
  const themes = [...darkThemes, ...lightThemes, ...otherThemes];

  // Prettier Plugins
  const plugins = [
    prettierPlugins.babel,
    prettierPlugins.html,
    prettierPlugins.postcss,
    prettierPlugins.json,
    prettierPlugins.markdown,
    prettierPlugins.typescript,
  ].filter(Boolean);

  const formattedCodeDiv = $('#output-code');
  let detectLanguageTimeout;

  /**
   * Show error messages in the UI.
   * @param {string} message - The error message to display.
   */
  function showError(message) {
    $('#error-message').text(message).show();
    setTimeout(() => $('#error-message').fadeOut(), 5000);
  }

  /**
   * Language Detection Section
   */

  /**
   * Detect programming language in the input code.
   * Updates appState.language and the #language UI element.
   */
  function detectLanguage() {
    if (!appState.rawCode.trim()) {
      appState.language = 'Unknown';
      $('#language').text(appState.language);
      return;
    }

    // Use Highlight.js to detect language
    const result = hljs.highlightAuto(appState.rawCode);
    appState.language = result.language || 'Unknown'; // Default to "Unknown" if detection fails
    $('#language').text(appState.language);
  }

  // Detect Language Dynamically
  $('#input-code').on('input', function () {
    appState.rawCode = $(this).val(); // Update rawCode in state

    // Clear any previous detection timers
    clearTimeout(detectLanguageTimeout);

    // Show progress indicator
    $('#language').text('Autodetecting...');
    appState.language = 'Autodetecting...';

    // Debounce detection
    detectLanguageTimeout = setTimeout(detectLanguage, 500);
  });

  /**
   * Code Formatting Section
   */

  /**
   * Reformat the raw code using Prettier.
   * Updates appState.formattedCode and the #output-code UI element.
   */
  $('#reformat-code').off('click').on('click', async function () {
    if (!appState.rawCode.trim()) {
      showError('Input code is empty.');
      return;
    }
    try {
      // Detect language before formatting
      detectLanguage();
      // Map detected language to Prettier parsers
      const languageToParser = {
        javascript: 'babel',
        html: 'html',
        css: 'css',
        json: 'json',
        typescript: 'typescript',
        yaml: 'yaml',
        markdown: 'markdown',
      };
      const parser = languageToParser[appState.language];
      if (!parser) {
        $('#output-code').text(appState.rawCode); // Fallback: raw code
        showError(`Language not supported: ${appState.language}`);
        return;
      }
      // Format using Prettier
      appState.formattedCode = await prettier.format(appState.rawCode, {
        parser: parser,
        plugins: plugins,
      });
      // Update UI
      if (parser === 'html') {
        $('#output-code').html(appState.formattedCode);
      } else {
        $('#output-code').text(appState.formattedCode);
      }
    } catch (error) {
      console.error('Formatting Error:', error.message);
      showError(`Failed to format code. ${error.message || 'Check the input syntax.'}`);
    }
  });

  /**
   * Code Presentation Section
   */

  /**
   * Highlight the code using Highlight.js.
   * Uses appState.formattedCode if available, otherwise appState.rawCode.
   */
  $('#present-code').on('click', function () {
    try {
      const inputToHighlight = appState.formattedCode || appState.rawCode;
  
      // Highlight the code using Highlight.js
      const highlightedCode = hljs.highlightAuto(inputToHighlight).value;
  
      // Inject the highlighted content
      const outputCodeDiv = $('#output-code');
      outputCodeDiv.html(highlightedCode).addClass('hljs');
  
      // Reapply custom CSS after highlighting
      const customCSS = $('#custom-css').val();
      applyCustomCSS(customCSS);
    } catch (error) {
      console.error('Highlight.js Error:', error.message);
      $('#output-code').text(appState.rawCode); // Fallback to plain text
      showError('Failed to highlight code. Displaying plain text.');
    }
  });

  /**
   * Theme Management Section
   */

  // Load themes into the DOM
  loadThemes(themes);

  // Load saved theme from localStorage and apply it on page load
  const savedTheme = localStorage.getItem("selectedTheme") || "default";

  // Generate the theme selector dynamically
  generateGroupedThemeSelector(groupedThemes, savedTheme);

  $(`#theme-${savedTheme}`).attr('disabled', false); // Enable the saved theme
  $('#theme').val(savedTheme); // Set the theme dropdown to the saved value

  /**
   * Generates a <select> dropdown for themes with grouped options.
   * Groups are created using <optgroup> for categories.
   * @param {Object} groupedThemes - Object containing categorized themes.
   * @param {string} [defaultTheme="default"] - The ID of the default theme to select.
   */
  function generateGroupedThemeSelector(groupedThemes, defaultTheme = "default") {
    const themeSelector = $("#theme");
    themeSelector.empty(); // Clear existing options

    // Iterate through each category and its themes
    Object.entries(groupedThemes).forEach(([group, themes]) => {
      const optgroup = $("<optgroup>").attr("label", group);
      themes.forEach((theme) => {
        const isSelected = theme.id === defaultTheme ? "selected" : "";
        optgroup.append(
          $("<option>")
            .val(theme.id)
            .text(theme.name)
            .attr("selected", isSelected)
        );
      });
      themeSelector.append(optgroup);
    });
  }

  // Handle theme selection changes
  $('#theme').on('change', function () {
    const selectedTheme = $(this).val();
  
    // Disable all themes
    $('link[rel="stylesheet"][id^="theme-"]').attr('disabled', true);
  
    // Enable the selected theme
    $(`#theme-${selectedTheme}`).attr('disabled', false);
  
    // Save the selected theme to localStorage
    localStorage.setItem('selectedTheme', selectedTheme);
  
    // Reapply custom CSS after theme changes
    const customCSS = $('#custom-css').val();
    applyCustomCSS(customCSS);
  });

  /**
   * Copy the content of the output-code div to the clipboard.
   */
  $('#copy-code').on('click', function () {
    const container = document.querySelector('#output-code');
    const range = document.createRange();
    const selection = window.getSelection();
  
    // Select the entire container
    range.selectNode(container);
    selection.removeAllRanges();
    selection.addRange(range);
  
    try {
      // Copy to clipboard
      const success = document.execCommand('copy');
      if (success) {
        console.log('Container and content copied successfully!');
      } else {
        console.error('Failed to copy container and content.');
      }
    } catch (error) {
      console.error('Error copying container:', error);
    }
  
    // Clear the selection after copying
    selection.removeAllRanges();
  });

  /**
   * Allow click-to-select all functionality in the output code div.
   */
  formattedCodeDiv.on('click', function () {
    const selection = window.getSelection();
    if (selection.isCollapsed) {
      const range = document.createRange();
      range.selectNodeContents(this);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  /**
   * Allow CMD/CTRL+A to select only the content inside the output code div.
   */
  formattedCodeDiv.on('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
      e.preventDefault(); // Prevent default page-wide select-all
      const range = document.createRange();
      range.selectNodeContents(this);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });

  /**
   * Dynamically loads Highlight.js themes into the DOM.
   * Each theme is added as a `<link>` tag, with all except the default theme disabled.
   * @param {Array<{id: string, name: string}>} themes - List of themes with their IDs and display names.
   * @param {string} [defaultTheme="monokai-sublime"] - The ID of the default theme to enable on load.
   */
  function loadThemes(themes, defaultTheme = 'default') {
    themes.forEach(theme => {
      const isDefault = theme.id === defaultTheme;
      $('head').append(
        `<link id="theme-${theme.id}" rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/${theme.id}.min.css" ${isDefault ? '' : 'disabled'}>`
      );
    });
  }

 /**
   * Custom CSS
   */
  
  // Create a <style> element to hold custom CSS
  const customStyle = $('<style id="custom-css-style"></style>').appendTo('head');

  // Debounce timer for custom CSS updates
  let customCSSTimeout;

  // Load saved CSS from localStorage and apply it on page load
  const savedCSS = localStorage.getItem('customCSS');
  if (savedCSS) {
    $('#custom-css').val(savedCSS); // Populate the textarea with saved CSS
    applyCustomCSS(savedCSS); // Apply the saved CSS
  }

  // Update the <style> element and save to localStorage whenever the user inputs custom CSS
  $('#custom-css').on('input', function () {
    const customCSS = $(this).val();

    // Clear any existing debounce timers
    clearTimeout(customCSSTimeout);

    // Debounce the CSS injection and saving
    customCSSTimeout = setTimeout(() => {
      applyCustomCSS(customCSS);

      // Save the custom CSS to localStorage
      localStorage.setItem('customCSS', customCSS);
    }, 500); // 500ms debounce delay
  });

  /**
   * Applies custom CSS by injecting it into a <style> tag in the <head>.
   * This ensures styles are scoped to #output-code and persist across updates.
   * @param {string} css - The custom CSS rules to apply.
   */
  function applyCustomCSS(css) {
    const scopedCSS = css
      ? `#output-code.hljs { ${css} }`
      : ''; // Scoped to #output-code.hljs for specificity

    // Update the <style> tag content
    customStyle.html(scopedCSS);
  }
  
});
