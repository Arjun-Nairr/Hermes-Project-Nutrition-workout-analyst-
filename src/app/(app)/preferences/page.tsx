import { getPreferences } from "@/lib/queries";
import { updatePreferences } from "@/lib/actions";
import { inputClass, labelClass, buttonClass, cardClass, headingClass } from "@/lib/ui";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  const prefs = await getPreferences();

  return (
    <div>
      <h1 className={`mb-4 ${headingClass}`}>Preferences</h1>
      <form action={updatePreferences} className={`space-y-6 p-6 ${cardClass}`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <label className="text-sm">
            <span className={labelClass}>Calories</span>
            <input name="calorieTarget" type="number" defaultValue={prefs.calorieTarget} className={`w-full ${inputClass}`} />
          </label>
          <label className="text-sm">
            <span className={labelClass}>Protein (g)</span>
            <input name="proteinTarget" type="number" defaultValue={prefs.proteinTarget} className={`w-full ${inputClass}`} />
          </label>
          <label className="text-sm">
            <span className={labelClass}>Carbs (g)</span>
            <input name="carbsTarget" type="number" defaultValue={prefs.carbsTarget} className={`w-full ${inputClass}`} />
          </label>
          <label className="text-sm">
            <span className={labelClass}>Fat (g)</span>
            <input name="fatTarget" type="number" defaultValue={prefs.fatTarget} className={`w-full ${inputClass}`} />
          </label>
        </div>

        <label className="block text-sm">
          <span className={labelClass}>Goal</span>
          <select name="goal" defaultValue={prefs.goal} className={`w-full ${inputClass}`}>
            <option value="cut">Cut</option>
            <option value="maintain">Maintain</option>
            <option value="bulk">Bulk</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className={labelClass}>Training days</span>
          <input name="trainingDays" defaultValue={prefs.trainingDays} placeholder="e.g. Mon/Wed/Fri" className={`w-full ${inputClass}`} />
        </label>

        <label className="block text-sm">
          <span className={labelClass}>Training style</span>
          <input name="trainingStyle" defaultValue={prefs.trainingStyle} placeholder="e.g. HIT, full body" className={`w-full ${inputClass}`} />
        </label>

        <button type="submit" className={`px-4 ${buttonClass}`}>
          Save
        </button>
      </form>
    </div>
  );
}
