# Carousel Domain Language
#
# This is the executable-domain model for the Infinite Scroll Carousel.
# It records the observable contract established by the React components,
# Vitest tests, and implementation comments. It is intentionally framework
# neutral: a renderer may implement it with React, CSS, Canvas, or another UI.

carousel InfiniteScroll {
  viewport full-screen
  presentation horizontal
  interaction scroll-only

  cards Card[] {
    require image: Url
    require title: Text
    require caption: Text
    require description: Text
    optional className: CssClass

    render {
      root class "carousel-card" + className
      image source image alt title loading lazy
      text caption as "card-caption"
      heading title level 3 as "card-title"
      text description as "card-description"
    }
  }

  track {
    copies 3
    active-copy middle
    item-width measured
    gap measured
    copy-width = cards.count * (item-width + gap)
    start-offset = copy-width
    loop-distance = copy-width
  }

  state {
    progress: Fraction = 0
    touch-origin-y: Pixel? = none
  }

  input {
    wheel delta-y {
      ignore when delta-y == 0
      prevent-default
      advance normalize(delta-y)
    }

    touch-start y { touch-origin-y = y }
    touch-move y when touch-origin-y exists {
      prevent-default
      advance touch-origin-y - y
      touch-origin-y = y
    }
    touch-end { touch-origin-y = none }
  }

  motion {
    pixels-per-lap = max(viewport.height * 2, 1)
    advance delta = progress = modulo(progress + delta / pixels-per-lap, 1)
    modulo value, base = ((value % base) + base) % base

    translate-x = -(start-offset + progress * loop-distance)
    render track at translate-x
  }

  focus-animation each card {
    source card.center-x / viewport.width
    current-time = clamp(source, 0, 1)
    keyframes {
      0.0 { scale 0.90; opacity 0.50 }
      0.5 { scale 1.06; opacity 1.00 }
      1.0 { scale 0.90; opacity 0.50 }
    }
  }

  lifecycle {
    mount when cards.count > 0 {
      create paused focus-animation for each rendered card
      listen wheel non-passive
      listen touch-start passive
      listen touch-move non-passive
      listen touch-end
      listen window.resize => render
      render
    }

    mount when cards.count == 0 { render no carousel items }

    unmount {
      remove all input and resize listeners
      cancel all focus-animations
    }
  }

  invariants {
    rendered-card-count = cards.count * 3 when cards.count > 0
    rendered-card-count = 0 when cards.count == 0
    0 <= progress < 1
    forward and reverse input both wrap without document scrolling
    every image alternative-text = card.title
    every image loading = lazy
    custom card classes preserve "carousel-card"
  }
}

# Example instance used by the application.
use InfiniteScroll with cards [
  card "Neon Metropolis" {
    image "/assets/neon_city.jpg"
    caption "Futuristic"
    description "A sprawling cyberpunk cityscape washed in brilliant neon light."
    class "neon-card-first"
  },
  card "Bioluminescent Grove" {
    image "/assets/cyberpunk_forest.jpg"
    caption "Nature"
    description "A hidden forest lit by purple and teal flora."
  }
]
