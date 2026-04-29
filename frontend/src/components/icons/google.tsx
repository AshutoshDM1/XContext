import * as React from 'react';

interface GoogleIconProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
}

export function GoogleIcon(props: GoogleIconProps) {
  const { width = 24, height = 24, ...restProps } = props;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      {...restProps}
    >
      <g>
        <path
          d="M21.805 10.023H12.22v3.955h5.48c-.235 1.18-.943 2.177-2.01 2.765l3.222 2.505c1.886-1.74 2.89-4.351 2.89-7.021 0-.529-.048-1.042-.138-1.504z"
          fill="#4285F4"
        />
        <path
          d="M12.219 22c2.613 0 4.81-.871 6.415-2.367l-3.223-2.505c-.894.597-2.029.962-3.192.962-2.453 0-4.532-1.658-5.276-3.893l-3.283 2.54C5.243 20.63 8.525 22 12.219 22z"
          fill="#34A853"
        />
        <path
          d="M6.943 14.197a6.362 6.362 0 010-4.394l-3.283-2.54A9.748 9.748 0 002.22 12c0 1.559.377 3.035 1.44 4.737l3.283-2.54z"
          fill="#FBBC05"
        />
        <path
          d="M12.22 7.579c1.425 0 2.698.488 3.705 1.444l2.774-2.773C17.025 4.869 14.832 4 12.22 4 8.526 4 5.243 5.37 3.16 8.197l3.283 2.54c.744-2.235 2.823-3.894 5.276-3.894z"
          fill="#EA4335"
        />
      </g>
    </svg>
  );
}

export default GoogleIcon;
