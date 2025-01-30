import { css } from "@emotion/react";
import gsap from "gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import Logo from "./assets/logo.svg?url";

const pages = ["wiki", "about", "download", "screenshot"];

export default function App() {
  const [started, setStarted] = useState(false);
  const [opened, setOpened] = useState(false);
  const [page, setPage] = useState(-1);
  const logoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const bigLinksRef = useRef<HTMLDivElement>(null);

  const startAnimation = () => {
    if (started || opened) return;
    setStarted(true);

    const logo = logoRef.current;
    const content = contentRef.current;
    const container = containerRef.current;
    const bigLinks = bigLinksRef.current;

    // 获取容器实际尺寸
    const { width: containerWidth, height: containerHeight } =
      container!.getBoundingClientRect();

    // 计算需要的缩放比例（覆盖整个容器）
    const scale = window.innerWidth / 80;

    // 创建动画时间线
    const tl = gsap.timeline({
      defaults: { ease: "power4.out" },
    });

    // 第一步：Logo放大到容器尺寸
    tl.to(
      logo,
      {
        scale: scale,
        duration: 1.5,
        // clipPath: "inset(0% 0% 0% 0%)",
        onStart: () => {
          // 预设置内容尺寸
          gsap.set(content, {
            width: containerWidth,
            height: containerHeight,
            visibility: "visible",
          });
        },
      },
      0
    )
      // 第二步：内容适配动画
      .fromTo(
        content,
        {
          x: "-50%",
          y: "-50%",
          scale: 0,
          opacity: 0,
        },
        {
          // 保持内容居中
          x: "-50%",
          y: "-50%",
          // 动态计算逆向缩放比例
          scale: 1 / scale,
          opacity: 1,
          duration: 1.6,
        },
        0
      )
      // 第三步：大链接从右往左依次滑入
      .from(
        [...(bigLinks?.children ?? [])],
        {
          x: 700,
          opacity: 0,
          stagger: 0.1,
          ease: "back.out",
          duration: 0.8,
        },
        0
      );

    tl.then(() => {
      setOpened(true);
    });
  };

  const back = useCallback(() => {
    if (!opened) return;
    setPage(-1);
    if (window.location.pathname !== "/") {
      window.history.pushState("", "", "/");
      onPopState();
    }
    console.log("back", page);

    const bigLinks = bigLinksRef.current;
    const links = [...(bigLinks?.children ?? [])];
    const link = links[page];
    const tl = gsap.timeline({
      defaults: { ease: "power4.out" },
    });
    tl.to(
      link,
      {
        x: 0,
        y: 0,
        duration: 0.5,
      },
      0
    ).to(
      link.querySelector("div"),
      {
        opacity: 1,
      },
      0
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, page]);
  const onBigLinkClick = (index: number) => {
    if (page > -1 || !opened) return;
    setPage(index);
    if (window.location.pathname !== `/${pages[index]}`) {
      window.history.pushState("", "", `/${pages[index]}`);
      onPopState();
    }
  };

  const onPopState = useCallback(() => {
    console.log(window.location.pathname, page);
    if (window.location.pathname === "/") {
      console.log("back", opened);
      back();
      return;
    }

    const bigLinks = bigLinksRef.current;
    const links = [...(bigLinks?.children ?? [])];
    const link = links[pages.indexOf(window.location.pathname.slice(1))];
    const rect = link.getBoundingClientRect();
    const tl = gsap.timeline({
      defaults: { ease: "power4.out" },
    });

    tl.to(
      link,
      {
        x: 450 - rect.left,
        y: 100 - rect.top,
        duration: 0.5,
      },
      0
    ).to(
      link.querySelector("div"),
      {
        opacity: 0,
      },
      0
    );
  }, [back, opened, page]);

  useEffect(() => {
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [onPopState, page]);

  return (
    <div
      css={css`
        width: 100vw;
        height: 100vh;
        background-color: #5c75ec;
        padding: 35px;
      `}
    >
      <div
        ref={containerRef}
        css={css`
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          width: 100%;
          height: 100%;
          border-radius: 50px;
          position: relative; /* 新增定位上下文 */
        `}
      >
        <div
          ref={logoRef}
          css={css`
            background-image: url("${Logo}");
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            clip-path: path(
              "M0 0V39.9978H40.0033V79.9955H80.0262V119.993H120.049V159.991H160.033V239.987H120.03V280.004H80.0151V319.963H40.0229V359.96H0V400H240.079V359.999H279.982V319.999H320.091V280.001H359.994V239.897H400V159.999H360.097V120.102H320.091V80.1015H280.085V40.1009H240.079V0H0Z"
            );
            width: 400px;
            height: 400px;
            transform: scale(1);
            position: relative;
          `}
          onClick={startAnimation}
        >
          <div
            ref={contentRef}
            css={css`
              visibility: hidden;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              display: flex;
              justify-content: center;
              align-items: center;
              opacity: 0;
              transform-origin: center center;
            `}
          >
            <div
              onClick={back}
              css={css`
                position: absolute;
                top: 50%;
                left: 0;
                transform: translateY(-50%);
                font-size: 120px;
                line-height: 0.5;
                font-family: Josefin Sans;
                writing-mode: vertical-lr;
                color: #5c75ec;
                white-space: nowrap;
                /* 保持原始文字大小 */
                transform: scale(1) translateY(-50%);
              `}
            >
              Toilet Minecraft
            </div>
            <div
              ref={bigLinksRef}
              css={css`
                position: absolute;
                display: flex;
                justify-content: center;
                align-items: start;
                flex-direction: column;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                gap: 2px;
              `}
            >
              <BigLink
                title="Wiki"
                label="维基"
                onClick={() => onBigLinkClick(0)}
                color="#5cec79"
              />
              <BigLink
                title="About"
                label="关于"
                onClick={() => onBigLinkClick(1)}
                color="#ec685c"
              />
              <BigLink
                title="Download"
                label="下载"
                onClick={() => onBigLinkClick(2)}
                color="#eccf5c"
              />
              <BigLink
                title="Screenshot"
                label="相片"
                onClick={() => onBigLinkClick(3)}
                color="#8e5cec"
              />
              <div
                css={css`
                  font-family: PPWriter;
                  font-size: 86px;
                  color: #5c75ec;
                  cursor: pointer;
                  position: relative;
                  line-height: 1;
                  font-style: italic;
                  margin-top: 48px;
                `}
              >
                play.toiletmc.net
              </div>
              <div
                css={css`
                  display: flex;
                  gap: 6px;
                  align-items: center;
                  margin-top: 32px;
                `}
              >
                <BottomLink href="https://toiletmc.net/qq" color="#ec5c5c">
                  qq
                </BottomLink>
                <Dot color="#ec5c5c" />
                <BottomLink
                  href="https://toiletmc.net/bilibili"
                  color="#ec5c5c"
                >
                  bilibili
                </BottomLink>
                <Dot color="#5cec91" />
                <BottomLink href="https://toiletmc.net/github" color="#5cec91">
                  github
                </BottomLink>
                <Dot color="#5cec91" />
                <BottomLink href="https://toiletmc.net/gitee" color="#5cec91">
                  gitee
                </BottomLink>
                <Dot color="#eca95c" />
                <BottomLink
                  href="https://www.minebbs.com/threads/1-19-2.13656/"
                  color="#eca95c"
                >
                  mimebbs
                </BottomLink>
                <Dot color="#eca95c" />
                <BottomLink
                  href="https://play.mcmod.cn/sv20183361.html"
                  color="#eca95c"
                >
                  mc百科
                </BottomLink>
                <Dot color="#eca95c" />
                <BottomLink
                  href="https://www.fansmc.com/server/426.html"
                  color="#eca95c"
                >
                  找服网
                </BottomLink>
                <Dot color="#9d5cec" />
                <BottomLink href="https://toiletmc.net/afdian" color="#9d5cec">
                  爱发电
                </BottomLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BigLink({
  title,
  label,
  onClick,
  color,
}: {
  title: string;
  label: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <div
      onClick={onClick}
      css={css`
        font-family: PPWriter;
        font-size: 86px;
        color: ${color};
        cursor: pointer;
        position: relative;
        line-height: 1;

        &:hover {
          text-decoration: underline;
          text-decoration-thickness: 8px;
        }
      `}
    >
      {title}
      <div
        css={css`
          font-family: system-ui, sans-serif;
          font-size: 56px;
          position: absolute;
          top: 50%;
          left: -1em;
          transform: translateY(-45%);
          font-weight: 300;
        `}
      >
        {label}
      </div>
    </div>
  );
}

function BottomLink({
  href,
  color,
  children,
}: {
  href: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      css={css`
        font-family: Miriam Libre;
        font-weight: 700;
        color: ${color};
        text-decoration: none;
        font-size: 24px;
        transition: 0.05s;

        &:hover {
          text-decoration: underline;
          text-decoration-thickness: 4px;
          text-underline-offset: 8px;
        }
        &:active {
          transform: scale(0.9);
        }
      `}
    >
      {children}
    </a>
  );
}
function Dot({ color }: { color: string }) {
  return (
    <div
      css={css`
        width: 4px;
        height: 4px;
        background-color: ${color};
        border-radius: 50%;
      `}
    ></div>
  );
}
