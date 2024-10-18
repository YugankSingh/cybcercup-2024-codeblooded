import { useMediaPredicate } from "react-media-hook"
import React from "react"

function ResponsiveRemovalHOC({
	child: Child,
	childProps,
	removalWidth,
	removalHeight,
}) {
	// const { child: Child, childProps, removalWidth, removalHeight } = props
	const smallWidth = useMediaPredicate(`(max-width: ${removalWidth}px)`)
	const smallHeight = useMediaPredicate(`(max-height: ${removalHeight}px)`)
	return <>{!smallWidth && !smallHeight && <Child {...childProps} />}</>
}

export default ResponsiveRemovalHOC
