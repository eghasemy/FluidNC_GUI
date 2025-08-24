---
sidebar_position: 2
---

# Installation

Getting started with FluidNC GUI is easy - no installation required! It runs directly in your web browser.

## Access FluidNC GUI

### Option 1: Online Version (Recommended)
Visit the live version at: **[https://eghasemy.github.io/FluidNC_GUI/](https://eghasemy.github.io/FluidNC_GUI/)**

![FluidNC GUI Home Page](/img/screenshots/docs-home-page.png)

✅ **Advantages:**
- Always up-to-date
- No setup required
- Works on any device with a web browser
- Automatically saves your work locally

### Option 2: Local Development
If you want to run it locally or contribute to development:

```bash
git clone https://github.com/eghasemy/FluidNC_GUI.git
cd FluidNC_GUI
npm install -g pnpm
pnpm install
pnpm dev
```

Then open `http://localhost:5173` in your browser.

## Browser Requirements

FluidNC GUI works with all modern browsers:

- ✅ **Chrome** (recommended)
- ✅ **Firefox**
- ✅ **Safari**
- ✅ **Edge**
- ✅ **Mobile browsers**

:::tip
For the best experience, use a desktop browser when creating configurations. The Expert Editor works better with a larger screen.
:::

## Data Storage

Your configurations are stored locally in your browser:

- **Automatic saving**: Your work is saved as you go
- **No account needed**: Everything stays on your device
- **Export anytime**: Download your configs as YAML or JSON files
- **Import configs**: Load existing configurations from files

## Security & Privacy

- **No data sent to servers**: All processing happens in your browser
- **Open source**: View the code on [GitHub](https://github.com/eghasemy/FluidNC_GUI)
- **No tracking**: We don't collect any personal information

## Next Steps

Now that you have access to FluidNC GUI, let's create your first configuration:

➡️ **[Create Your First Config](./first-config.md)**

## Troubleshooting

### Browser Compatibility Issues
If you experience issues:

1. **Update your browser** to the latest version
2. **Clear browser cache** and reload the page
3. **Try a different browser** (Chrome is most thoroughly tested)
4. **Disable browser extensions** that might interfere

### Performance Issues
For large or complex configurations:

- Use a desktop browser instead of mobile
- Close other browser tabs to free up memory
- Consider using the local development version

Need more help? Check our **[Troubleshooting](../troubleshooting/index.md)** section.