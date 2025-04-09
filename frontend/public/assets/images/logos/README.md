# VetSphere Logo Files

This directory contains the official logo files for VetSphere. These files should be used consistently across the application to maintain brand identity.

## Available Logo Files

- **black_transparent.png**: Black text with transparent background (for light backgrounds)
- **white_transparent.png**: White text with transparent background (for dark backgrounds)
- **non_transparent_blackText_whiteBackground.png**: Black text with white background (for fallback)

## When to Use Each Logo

- **Light Backgrounds**: Use `black_transparent.png` for most light-colored backgrounds
- **Dark Backgrounds**: Use `white_transparent.png` for dark-colored backgrounds and header areas
- **Special Cases**: Use `non_transparent_blackText_whiteBackground.png` when transparency isn't supported

## Usage in React Components

Import and use the logo in React components like this:

```jsx
<Box 
  component="img" 
  src="/assets/images/logos/black_transparent.png" 
  alt="VetSphere" 
  sx={{ 
    height: 60,
    width: 'auto'
  }} 
/>
```

For responsive sizing, consider using relative units:

```jsx
<Box 
  component="img" 
  src="/assets/images/logos/black_transparent.png" 
  alt="VetSphere" 
  sx={{ 
    maxHeight: { xs: '40px', md: '60px' },
    width: 'auto'
  }} 
/>
```

## Brand Guidelines

Always follow these guidelines when using the VetSphere logo:

1. **Spacing**: Maintain adequate space around the logo (at least equal to the height of the "V" in VetSphere)
2. **Proportions**: Don't stretch or distort the logo; maintain the original aspect ratio
3. **Color**: Don't change the logo colors; use the appropriate version for your background
4. **Minimum Size**: Don't use the logo smaller than 30px in height to maintain legibility
5. **Tagline**: When using the tagline "Beyond Records, Beyond Care," position it below the logo

## Tagline Usage

The tagline should be used in contexts where the brand's mission needs to be emphasized:

```jsx
<Box sx={{ textAlign: 'center' }}>
  <Box 
    component="img" 
    src="/assets/images/logos/black_transparent.png" 
    alt="VetSphere" 
    sx={{ height: 60, mb: 1 }} 
  />
  <Typography 
    variant="subtitle2"
    sx={{ 
      fontStyle: 'italic',
      color: 'text.secondary' 
    }}
  >
    Beyond Records, Beyond Care
  </Typography>
</Box>
``` 