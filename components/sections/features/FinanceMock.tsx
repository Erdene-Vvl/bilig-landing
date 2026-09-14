import { financeFeature } from "@/data/content";
import { dotColor } from "@/lib/colors";
import { MockWindow } from "./MockWindow";

export function FinanceMock() {
  return (
    <MockWindow>
      <div className="grid gap-[9px]">
        {financeFeature.rows.map((row) => (
          <div key={row.name} className="c-cell flex items-center gap-[11px] px-[14px] py-3 text-[13.5px]">
            <span className={`h-2 w-2 flex-none rounded-full ${dotColor[row.dot]}`} />
            <b className="font-semibold">{row.name}</b> | {row.meta}
            <small className="ml-auto font-mono-brand text-[11.5px] text-txt-2">{row.note}</small>
          </div>
        ))}
      </div>
    </MockWindow>
  );
}
